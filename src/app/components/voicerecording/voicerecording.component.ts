import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Gesture, GestureController, GestureDetail, IonicModule } from '@ionic/angular';
import { GenericResponse, RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { BehaviorSubject, Observable, interval, map, of, scan, shareReplay, startWith, switchMap } from 'rxjs';

@Component({
    selector: 'app-voicerecording',
    standalone: true,
    imports: [
        CommonModule,
        IonicModule
    ],
    templateUrl: './voicerecording.component.html',
    styleUrls: ['./voicerecording.component.scss']
})
export class VoicerecordingComponent implements OnInit {
    @ViewChild('recordingButtonElement') recordingButtonElementRef!: ElementRef;

    // 長按手勢
    private longPressGesture!: Gesture;

    // 錄音的開關
    private isRecordingSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    // 錄音計時器
    public timer$ = this.isRecording$.pipe(
        switchMap(isRecording =>
            isRecording ? interval(1000).pipe(
                // 使用 scan 累加每一秒的值，第一次累加會從 0 開始
                scan(acc => acc + 1, 0),
                // 轉換為分鐘和秒數
                map(tick => ({
                    minutes: Math.floor(tick / 60),
                    seconds: tick % 60
                }))
            ) :
                // 如果 isRecording$ 為 false，則發出一個重置的時間
                of({ minutes: 0, seconds: 0 })
        ),
        // 將分鐘和秒數重新Format成兩位數顯示
        map(timeData => ({
            minutes: timeData.minutes.toString().padStart(2, '0'),
            seconds: timeData.seconds.toString().padStart(2, '0')
        })),
        // 初始值
        startWith({ minutes: '00', seconds: '00' }),
        shareReplay(1)
    );

    get isRecording$(): Observable<boolean> {
        return this.isRecordingSubject$.asObservable();
    }

    private get recordingButton(): HTMLDivElement {
        return this.recordingButtonElementRef?.nativeElement;
    }

    constructor(private gestureCtrl: GestureController) { }

    ngOnInit(): void { }

    ngAfterViewInit(): void {
        this.longPressGesture = this.gestureCtrl.create({
            el: this.recordingButton, // 目標元素
            gestureName: 'LongPressGesture', // 手勢的命名
            threshold: 0, // 設置觸發手勢的閾值，0 表示觸摸到就觸發
            onStart: (detail: GestureDetail) => {
                // 震動反饋，震動程度有輕微（Light）、重度（Heavy）、中等（Medium）可以選擇
                Haptics.impact({ style: ImpactStyle.Medium });
                // 手勢開始時的事件
                this.startRecording();
            },
            onEnd: (detail: GestureDetail) => {
                // 震動反饋，震動程度有輕微（Light）、重度（Heavy）、中等（Medium）可以選擇
                Haptics.impact({ style: ImpactStyle.Medium });
                // 手勢結束時的事件
                this.stopRecording();
            }
        }, true);
        // 檢查是否有權限
        VoiceRecorder.requestAudioRecordingPermission().then((result: GenericResponse) => {
            if (result.value) {
                // 啟用長按手勢
                this.longPressGesture.enable();
            }
        })
    }


    startRecording() {
        this.isRecordingSubject$.next(true);
        // 開始錄音
        VoiceRecorder.startRecording();
    }

    stopRecording() {
        this.isRecordingSubject$.next(false);
        // 停止錄音
        VoiceRecorder.stopRecording().then((result: RecordingData) => {
            if (result.value && result.value.recordDataBase64) {
                alert(result.value.recordDataBase64);
            }
        })
    }
}