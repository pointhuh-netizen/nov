/**
 * index.js — Style Engine 확장 메인 진입점
 * SillyTavern 3rd-party 확장. 문체 조합 빌더를 제공한다.
 */

import { getContext, extension_settings } from '../../../extensions.js';
import { eventSource, event_types, saveSettingsDebounced } from '../../../../script.js';
import { injectPrompt } from './src/prompt-injector.js';
import { openPopup, onChatChanged, clearCurrentBuild } from './src/ui-controller.js';

const EXTENSION_NAME = 'sillytavern-style-engine';

// 확장 설정 기본값
const DEFAULT_SETTINGS = {
    enabled: true,
};

/**
 * 설정 초기화
 */
function initSettings() {
    if (!extension_settings[EXTENSION_NAME]) {
        extension_settings[EXTENSION_NAME] = { ...DEFAULT_SETTINGS };
    }
    // 누락된 기본값 채우기
    Object.assign(
        extension_settings[EXTENSION_NAME],
        { ...DEFAULT_SETTINGS, ...extension_settings[EXTENSION_NAME] }
    );
}

/**
 * settings.html을 확장 설정 패널에 삽입
 */
async function loadSettingsPanel() {
    const settingsHtml = await $.get(
        `/scripts/extensions/third-party/${EXTENSION_NAME}/settings.html`
    );
    // ST 확장 설정 컨테이너에 추가
    const $container = $('#extensions_settings');
    if ($container.length) {
        $container.append(settingsHtml);
    } else {
        // fallback: 확장 설정 영역 탐색
        $('[data-extension="' + EXTENSION_NAME + '"]').append(settingsHtml);
    }
}

/**
 * settings 패널 버튼 이벤트 바인딩
 */
function bindSettingsEvents() {
    // 문체 빌더 열기 버튼
    $(document).on('click', '#style-engine-open-btn', async function () {
        await openPopup();
    });

    // 빌드 초기화 버튼
    $(document).on('click', '#style-engine-clear-btn', function () {
        clearCurrentBuild();
        toastr.success('문체 빌드가 초기화되었습니다.', 'Style Engine');
    });
}

/**
 * SillyTavern 이벤트 리스너 등록
 */
function registerEventListeners() {
    // 채팅 전환 시 저장된 빌드 불러오기
    eventSource.on(event_types.CHAT_CHANGED, () => {
        onChatChanged();
    });

    // 생성 직전에 빌드된 프롬프트 주입
    eventSource.on(event_types.GENERATION_STARTED, () => {
        if (extension_settings[EXTENSION_NAME]?.enabled) {
            injectPrompt();
        }
    });
}

/**
 * 확장 초기화 (jQuery ready 후 실행)
 */
async function init() {
    console.log(`[${EXTENSION_NAME}] Initializing Style Engine...`);

    try {
        // 설정 초기화
        initSettings();

        // 설정 패널 로드
        await loadSettingsPanel();

        // 이벤트 바인딩
        bindSettingsEvents();

        // ST 이벤트 리스너 등록
        registerEventListeners();

        // 현재 채팅의 빌드 상태 복원 (이미 채팅이 로드된 경우)
        onChatChanged();

        console.log(`[${EXTENSION_NAME}] Style Engine initialized.`);
    } catch (err) {
        console.error(`[${EXTENSION_NAME}] Initialization error:`, err);
    }
}

// jQuery ready 시 초기화
$(document).ready(() => {
    init();
});
