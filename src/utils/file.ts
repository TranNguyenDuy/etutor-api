export const extractFileName = (fileName: string) => {
    const extIndex = fileName.lastIndexOf('.');
    if (!extIndex) return {
        name: '',
        ext: ''
    };
    const name = fileName.substring(0, extIndex);
    const ext = fileName.substring(extIndex + 1);
    return {
        name,
        ext
    };
};