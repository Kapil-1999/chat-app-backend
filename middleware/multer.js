import multer from "multer";

const storage = multer.diskStorage({
    filename : (req, file , cd) => {
        return cd(null , file.originalname)
    }
});

const upload = multer({ storage: storage })

export default upload