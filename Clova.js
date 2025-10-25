/* Module Import */
const axios = require('axios');
const fs = require('fs');

const MY_OCR_API_URL = process.env.NAVER_OCR_API_URL;
const MY_OCR_SECRET_KEY = process.env.NAVER_OCR_CLIENT_SECRET;

/**
 * 이미지 버퍼를 사용하여 네이버 클로바 OCR API를 호출하고 텍스트를 추출합니다.
 * @param {Buffer} imageBuffer - 안드로이드 앱에서 받은 사진의 이진 데이터
 * @param {string} imageName - 파일 이름 (확장자 추출용)
 * @returns {Promise<string>} 인식된 모든 텍스트를 합친 문자
 */
async function Clova(imageBuffer, imageName) {
    return new Promise((resolve, reject) => {
        let config = {
            headers: {
                "Content-Type" : "application/json",
                "X-OCR-SECRET" : MY_OCR_SECRET_KEY
            }
        }

        let timestamp = new Date().getTime();
        let sumText = "";

        /* Axios URL Call & Work Response Data */
        axios.post(MY_OCR_API_URL, 
            {
            "images": [
                {
                    "format": "png",
                    "name": "medium",
                    "data": imageBuffer.toString('base64'),
                    "url": null
                }
            ],
            "lang": "ko",
            "requestId": "string",
            "resultType": "string",
            "timestamp": timestamp,
            "version": "V1"
            }, config)
          .then(function (response) {

            /* Make Response Data to Text Data */
            response.data.images[0].fields.forEach(element => {
                console.log(element.inferText);
                sumText += " " + element.inferText;
            });

            console.log("-------------------");
            console.log(sumText);
            console.log("-------------------");

            /* Return the extracted text */
            resolve(sumText.trim());

          })
          .catch(function (error) {
            console.log(error);
            reject(error);
    });
    });
}

module.exports = { Clova };