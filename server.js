require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path'); // <--- 경로 모듈 추가

const app = express();  // express 라이브러리 사용한다 
const port = 3000;

const { Clova } = require('./Clova.js'); // 함수 불러오기
const { findStoreNameByText } = require('./findStoreNameByText.js'); // 함수 불러오기


const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());  // cors 미들웨어 사용
app.use(express.json());  // json 형태로 데이터 주고받기

//3000 포트로 서버 오픈
app.listen(port, function(){
    console.log(`Server is running on port ${port}`);
});

app.post('/api/get-location-id', upload.single('storeImage'), async (req, res) => {
    // req.file.buffer는 Multer가 확보한 이미지 데이터입니다.
    const imageBuffer = req.file.buffer;
    const imageName = req.file.originalname;

    try {

        console.log(`안드로이드 앱에서 ${imageName}을 CLOVA OCR에 전송합니다.`);

        // 3. OCR 호출 및 텍스트 추출
        const recognizedText = await Clova(imageBuffer, imageName);
        console.log(`[테스트 성공] 인식된 텍스트: ${recognizedText}`);
        findStoreNameByText(recognizedText).then(storeName => {
            console.log(`[테스트 결과] 매칭된 가게 이름: ${storeName}`);
            return res.status(200).json({ 
                matchedStoreName: storeName
            });
        });

    } catch (error) {
        console.error("❌ 테스트 중 오류 발생:", error);
        return res.status(500).json({ 
            status: "error",
            message: "CLOVA OCR 테스트 중 서버 오류가 발생했습니다."
        });
    }
});

app.get('/api/test-local-ocr', async (req, res) => {
    
    // 🚨 여기에 테스트 경로 입력 🚨
    const TEST_IMAGE_FILENAME = 'local_test_image.jpg'; 
    const testImagePath = path.join(__dirname, TEST_IMAGE_FILENAME);

    try {
        // 2. 파일 시스템에서 이미지 파일을 Buffer 형태로 읽어옵니다.
        const imageBuffer = fs.readFileSync(testImagePath);
        const imageName = TEST_IMAGE_FILENAME; // 파일명 지정

        console.log(`[테스트 시작] 로컬 파일 ${imageName}을 CLOVA OCR에 전송합니다.`);

        // 3. OCR 호출 및 텍스트 추출
        const recognizedText = await Clova(imageBuffer, imageName);
        console.log(`[테스트 성공] 인식된 텍스트: ${recognizedText}`);
        findStoreNameByText(recognizedText).then(storeName => {
            console.log(`[테스트 결과] 매칭된 가게 이름: ${storeName}`);
            return res.status(200).json({ 
                matchedStoreName: storeName
            });
        });

    } catch (error) {
        console.error("❌ 테스트 중 오류 발생:", error);
        return res.status(500).json({ 
            status: "error",
            message: "CLOVA OCR 테스트 중 서버 오류가 발생했습니다."
        });
    }
});