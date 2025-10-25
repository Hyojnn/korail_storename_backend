const fs = require('fs');
const path = require('path');

// 1. JSON 파일 경로 설정 (Canvas의 store_list.json 파일)
const STORE_LIST_PATH = path.join(__dirname, 'store_list.json');
let storeList = [];

// 2. 서버 시작 시 파일을 한 번만 로드하는 함수
function loadStoreData() {
    try {
        const data = fs.readFileSync(STORE_LIST_PATH, 'utf8');
        storeList = JSON.parse(data);
        console.log(`[File Matcher] ✅ ${storeList.length}개의 가게 데이터를 로드했습니다.`);
    } catch (error) {
        console.error(`[File Matcher] ❌ 가게 목록 파일을 로드할 수 없습니다: ${error.message}`);
        throw new Error("LocalDataLoadError: 가게 목록 JSON 파일 로드 실패");
    }
}

// 서버 시작 시 데이터 로드
loadStoreData();

/**
 * OCR로 인식된 텍스트를 분석하여, 일치하는 키워드가 있는 가게의 이름을 반환합니다.
 * @param {string} recognizedText - OCR로 인식된 모든 텍스트
 * @returns {Promise<string|null>} - 일치하는 가게 이름 (name) 또는 null
 */
async function findStoreNameByText(recognizedText) {
    // 텍스트를 소문자로 변환하고 공백을 기준으로 키워드 배열 생성
    // (길이 1 이하의 단어는 제외하여 정확도를 높입니다.)
    const recognizedKeywords = recognizedText.toLowerCase().split(/\s+/).filter(k => k.length > 1);

    if (recognizedKeywords.length === 0) {
        console.log(`[Matcher] 인식된 키워드가 없습니다.`);
        return null;
    }

    // 모든 가게 목록을 순회하며 매칭되는 키워드가 있는지 확인
    for (const store of storeList) {
        
        // store의 ocr_keywords 배열을 순회하며 인식 키워드와 비교
        const isMatched = store.ocr_keywords.some(storeKeyword => {
            // 인식된 키워드 중 하나라도 storeKeyword와 정확히 일치하는지 확인
            return recognizedKeywords.includes(storeKeyword.toLowerCase());
        });

        if (isMatched) {
            console.log(`[Matcher] ✅ 가게 특정 성공! 일치 키워드 기반: ${store.name}`);
            // 일치하는 가게의 name을 즉시 반환
            return store.name; 
        }
    }
    
    // 일치하는 가게를 찾지 못했으면 null 반환
    console.log(`[Matcher] ❌ 일치하는 가게를 찾지 못했습니다.`);
    return null;
}

// 이 함수가 server.js에서 사용될 수 있도록 export합니다.
module.exports = { findStoreNameByText };