// get file size in readable format with bytes as the smallest unit
export const getFileSize = (size: number) => {
    const units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    let unit = 0;
    while (size > 1024) {
        size /= 1024;
        unit++;
    }
    return `${size.toFixed(2)} ${units[unit]}`;
}

// download file
export const downloadFile = (file: File, fileName: string) => {
    let downloadLink = document.createElement('a');
    downloadLink.download = fileName;
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.click();
}