import { makeAutoObservable } from "mobx";
// import { ffmpegData } from '@/store/ffmpegOptins';
import { deepClone } from '@/utils/utils';

class Watermark {

    ImageWatermarkData = [];
    TextWatermarkData = [];
    CameraWatermarkData = [];
    AllData = [];


    constructor() {
        makeAutoObservable(this);
    }

    setImageWater(item, isClear) {
        if (isClear) {
            this.clearImageWater();
            this.ImageWatermarkData = item;
            return;
        }
        this.ImageWatermarkData = [...this.ImageWatermarkData, item];
    }
    clearImageWater() {
        this.ImageWatermarkData = [];
    }

    setTextWater(item, isClear) {
        if (isClear) {
            this.clearTextWater();
            this.TextWatermarkData = item;
            return;
        }
        this.TextWatermarkData = [...this.TextWatermarkData, item];
    }
    clearTextWater() {
        this.TextWatermarkData = [];
    }

    setCameraWater(item, isClear) {
        if (isClear) {
            this.clearCameraWater();
            this.CameraWatermarkData = item;
            return;
        }
        this.CameraWatermarkData = [...this.CameraWatermarkData, item];
    }
    clearCameraWater() {
        this.CameraWatermarkData = [];
    }
    
    setAllData(List, isClear) {
        if (isClear) {
            this.clearAllData();
            this.AllData = List;
            return;
        }
        this.AllData = [...this.AllData, ...List];
    }

    clearAllData() {
        this.AllData = [];
    }

}

export const WatermarkData = new Watermark();