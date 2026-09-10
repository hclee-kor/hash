document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const resultArea = document.getElementById('result-area');
    const fileNameDisplay = document.getElementById('file-name');
    const fileHashDisplay = document.getElementById('file-hash');
    const fileRemarkDisplay = document.getElementById('file-remark');
    const dropZoneText = document.getElementById('drop-zone-text');

    let hashMap = {};

    // 1. 페이지 로드 시 hashes.json 목록 가져오기
    fetch('hashes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('hashes.json 로드 실패');
            }
            return response.json();
        })
        .then(data => {
            hashMap = data;
            console.log('해시 목록이 성공적으로 로드되었습니다.', hashMap);
        })
        .catch(error => {
            console.error('에러:', error);
            alert('해시 목록(hashes.json)을 불러오지 못했습니다.');
        });

    // 2. 드래그 앤 드롭 이벤트 처리
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            // 복수의 파일이 들어와도 첫 번째 파일 1개만 처리
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    });

    // 3. 클릭해서 파일 탐색기 열기
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            processFile(file);
            // 같은 파일을 다시 선택해도 change 이벤트가 발생하도록 value 초기화
            e.target.value = ''; 
        }
    });

    // 4. 파일 읽기 및 해시 계산 로직
    function processFile(file) {
        dropZoneText.innerHTML = "파일 해시 계산 중입니다...<br>잠시만 기다려주세요.";
        resultArea.style.display = 'none';

        const reader = new FileReader();

        // 파일을 성공적으로 읽었을 때
        reader.onload = async (event) => {
            try {
                const arrayBuffer = event.target.result;
                
                // Web Crypto API를 사용하여 SHA-256 해시값 생성
                const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
                
                // 버퍼를 16진수 문자열(Hex String)로 변환
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                // 화면에 결과 표시
                displayResult(file.name, hashHex);
            } catch (error) {
                console.error('해시 계산 에러:', error);
                alert('해시를 계산하는 중 오류가 발생했습니다.');
            } finally {
                dropZoneText.innerHTML = "여기로 파일을 드래그 앤 드롭 하거나<br>클릭하여 파일을 선택하세요.";
            }
        };

        // 파일 읽기 실패 시
        reader.onerror = () => {
            alert('파일을 읽는 중 오류가 발생했습니다.');
            dropZoneText.innerHTML = "여기로 파일을 드래그 앤 드롭 하거나<br>클릭하여 파일을 선택하세요.";
        };

        // 파일을 ArrayBuffer 형태로 읽기 시작
        reader.readAsArrayBuffer(file);
    }

    // 5. 결과를 화면에 출력하고 목록과 비교하는 함수
    function displayResult(fileName, hashHex) {
        fileNameDisplay.textContent = fileName;
        fileHashDisplay.textContent = hashHex;

        // hashes.json에 계산된 해시값이 존재하는지 검사
        if (hashMap.hasOwnProperty(hashHex)) {
            fileRemarkDisplay.textContent = hashMap[hashHex];
            fileRemarkDisplay.className = 'highlight-remark';
        } else {
            fileRemarkDisplay.textContent = "목록에 없는 해시값입니다.";
            fileRemarkDisplay.className = 'normal-remark';
        }

        // 결과 영역 보여주기
        resultArea.style.display = 'block';
    }
});
