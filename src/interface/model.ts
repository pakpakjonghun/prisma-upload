
export interface IFileMetadata {
    _id: string;
    size: string;
    filename: string;
    mimetype: string;
    path: string;
    isMapped: boolean;
    mappedTo: string;
    createdAt: Date;

}


/**
 * @interface IImageFileMetadata
 * @extends IFileMetadata
 * @description * 이미지 파일 메타데이터 인터페이스
 */
export interface IImageFileMetadata extends IFileMetadata {
    /**
     * @decription 가로 픽셀 길이
     */
    wPx: number;

    /**
     * @decription 세로 픽셀 길이
     */
    hPx: number;

    /**
     * @decription 색상 채널 (rgb, cmyk)
     */
    channels: string;

    /**
     * @decription 밀도 단위 해상도
     */
    dpi: number;

    /**
     * @decription 색영역
     */
    colorProfile: string;
}

/**
 * @interface IVideoFileMetadata
 * @extends IFileMetadata
 * @description * 비디오 파일 메타데이터 인터페이스
 */
export interface IVideoFileMetadata extends IFileMetadata {
    /**
     * @decription 가로 픽셀 길이
     */
    wPx: number;

    /**
     * @decription 세로 픽셀 길이
     */
    hPx: number;

    /**
     * @decription 색상 채널 (rgb, cmyk)
     */
    channels: string;

    /**
     * @decription 밀도 단위 해상도
     */
    dpi: number;

    /**
     * @decription 색영역
     */
    colorProfile: string;
}
