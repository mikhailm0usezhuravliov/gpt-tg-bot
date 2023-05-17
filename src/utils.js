import { unlink } from 'fs/promises'

export async function removeFile(path) {
    try {
        await unlink(path);
    } catch (e) {
        console.log(`error while deleting ogg ${e.message}`);
    }
}