# SillyTavern Style Engine

SillyTavern용 모듈형 프롬프트 아키텍처. 기본틀(Default Template) 위에 Config(독립 설정) → N축(복합 문체) → A~G축(단일 차원)을 순서대로 오버레이하여 문체를 조합하는 시스템.

---

## 아키텍처

```
sillytavern-style-engine/
├── core/
│   ├── default-template.json     ← 기본 문체 ("외부 관찰형"), 8개 MODULE, 슬롯 시스템
│   └── master-rules.json         ← 불변 규칙 (core_directives, forbidden 패턴/어휘/대사)
├── configs/
│   └── user-character-control.json ← 유저 캐릭터 제어 (RP/사칭/사용안함)
├── axes/
│   ├── axis-n-narrative-mode.json ← N축: 복합 문체 (서사 모드). 1계층. N-00~N-04
│   ├── axis-a-pov.json            ← A축: 시점·서술방식. 2계층. A-00~A-06
│   ├── axis-b-tone.json           ← B축: 어조·어휘. 2계층. B-00~B-07
│   ├── axis-c-genre.json          ← C축: 장르. 2계층. 비어있음
│   ├── axis-d-mood.json           ← D축: 분위기. 2계층. 비어있음
│   ├── axis-e-setting.json        ← E축: 배경. 2계층. 비어있음
│   ├── axis-f-special.json        ← F축: 특별 요소. 2계층. 비어있음
│   └── axis-g-interaction.json    ← G축: 상호작용. 2계층. 비어있음
├── meta/
│   ├── catalog.json               ← UI 카탈로그 (모든 축/모듈 등록)
│   ├── config-schema.json         ← 독립 설정 레지스트리
│   ├── trait-schema.json           ← 모듈 특성(traits) 스키마 정의
│   └── combinations.json          ← 조합 자동 충돌 감지 규칙
└── presets/
    └── .gitkeep                   ← 인기 조합 저장 (향후)
```

---

## 3계층 구조

| 계층 | 유형 | 역할 | 선택 방식 |
|---|---|---|---|
| **0계층** | **Config** | 축과 독립적으로 작동하는 빌드 레벨 설정. 모든 축에 걸쳐 적용되는 근본 규칙 결정 | 각 config별 MUTEX |
| **1계층** | **N** | 복합 문체 선택. 여러 축의 슬롯을 동시에 설정하고, static/preamble을 교체하며, 고유 구조 법칙을 깔아둠 | MUTEX (0 또는 1개) |
| **2계층** | **A** | 단일 차원 미세 조정. N축이 깔아놓은 값 위에 특정 슬롯만 덮어씀 | MUTEX |
| **2계층** | **B** | 단일 차원 미세 조정. N축이 깔아놓은 값 위에 특정 슬롯만 덮어씀 | MUTEX |
| **2계층** | **C~G** | 단일 차원 미세 조정. N축이 깔아놓은 값 위에 특정 슬롯만 덮어씀 | COMBINABLE |

**핵심 원칙:** Config가 빌드의 근본 규칙을 결정 → N축이 default-template 위에 복합 문체 전체를 설정 → A~G축이 그 위에서 원하는 차원만 미세 조정.

---

## 빌드 순서

```
configs → N → A → B → C → D → E → F → G
```

1. `default-template.json` 로드 (모든 슬롯에 기본값)
2. `master-rules.json` 로드 (항상 포함)
3. **Config** 적용 (유저 캐릭터 제어 등 근본 설정)
4. **N축** 모듈 적용 (복합 문체 전체 설정)
5. **A축** 모듈 적용 (시점 미세 조정)
6. **B~G축** 모듈 적용 (각 차원 미세 조정)
7. `check_operations` 병합 (ADD/REPLACE/REMOVE)
8. 충돌 검사 (`combinations.json` 참조)
9. 최종 프롬프트 조립 → SillyTavern 주입

---

## Config 시스템 (0계층)

Config는 축(axis)과 달리 슬롯을 직접 건드리는 것이 아니라, **빌드 시 적용되는 근본 규칙**을 결정합니다.

### Config vs Axis 차이

| 특성 | Config (0계층) | Axis (1~2계층) |
|---|---|---|
| 빌드 시점 | 축보다 **먼저** 적용 | Config 이후 적용 |
| 작동 방식 | injections (주입), master-rules override | operations (슬롯 교체/추가) |
| 영향 범위 | 모든 축에 걸쳐 작동 | 자기 슬롯만 또는 N축처럼 복합 |
| 파일 위치 | `configs/` 디렉토리 | `axes/` 디렉토리 |
| 적용 기준 | 모든 문체 조합에서 동일하게 적용 | 문체에 따라 달라짐 |

### 현재 Config 목록

| ID | 이름 | 파일 | 모드 수 |
|---|---|---|---|
| user_character_control | 유저 캐릭터 제어 🎭 | `configs/user-character-control.json` | 3 (UCC-00, UCC-01, UCC-02) |

### 유저 캐릭터 제어 (user_character_control)

AI가 유저 캐릭터({{user}})를 어떻게 다루는지 결정합니다.

| 모드 | ID | 설명 |
|---|---|---|
| **사용하지 않음** | UCC-00 | 유저 캐릭터 제어 지시를 주입하지 않음. 기존 프롬프트/설정을 그대로 사용 |
| **RP 모드** | UCC-01 | {{user}}의 행동·내면·대사는 유저만 결정. AI는 NPC만 서술. `master-rules.json`의 `godmoding_rule` 강화 |
| **사칭 모드** | UCC-02 | AI가 {{user}}도 소설 속 인물처럼 자율 서술. 행동·내면·대사 모두 AI가 생성 가능. `godmoding_rule` 해제 |

**Config 포맷:**

```json
{
  "config": "config_key",
  "type": "mutex",
  "build_priority": -1,
  "modes": [
    {
      "id": "UCC-01",
      "name": "RP 모드",
      "operations": { },
      "injections": {
        "preamble_core_directives_add": ["..."],
        "static_MODULE_1_VOICE_add": ["..."],
        "master_rules_godmoding_override": "..."
      },
      "check_operations": [ ]
    }
  ]
}
```

**Injection 타입:**

| injection key | 설명 |
|---|---|
| `preamble_core_directives_add` | `master-rules.json`의 `core_directives` 배열에 항목 추가 |
| `static_MODULE_1_VOICE_add` | MODULE_1_VOICE의 static 배열에 항목 추가 |
| `master_rules_godmoding_override` | `master-rules.json`의 `godmoding_rule`을 교체. `null`이면 해당 규칙 비활성화 |

---

## Traits 시스템

각 모듈은 `traits` 필드를 가진다. traits는 모듈의 결과물 특성을 구조화된 태그로 표현하여, 모듈 조합 시 자동 충돌 감지에 사용된다.

### 주요 traits

| trait | 설명 | 적용 축 |
|---|---|---|
| `pov` | 시점 | N, A |
| `inner_access` | 인물 내면 접근 수준 | N, A |
| `fid` | FID 사용 범위 | N, A |
| `emotion_level` | 감정 표현 허용 수준 | N, A, B |
| `sentence_length` | 지배적 문장 길이 | N, A, B |
| `sensory_anchor` | 감각 우선순위의 앵커 | N, A |
| `formality` | 격식 수준 | N, B |
| `irony` | 아이러니/냉소 사용 여부 | B |
| `lyricism` | 서정성 수준 | N, B |
| `narrator_presence` | 서술자 존재감 | N, A, B |
| `personification` | 의인화 허용 수준 | A, B, F |
| `temporal_mode` | 시간 구조 | N, A |
| `slots_touched` | 교체/추가하는 슬롯 목록 | 전체 |

### 충돌 감지

`meta/combinations.json`의 `auto_rules`가 traits를 비교하여 충돌을 감지한다:

- **error**: 조합 불가 (시점 충돌, FID 충돌, 서술자/1인칭 충돌)
- **warning**: 조합 가능하나 빌드 순서 주의 (문장 길이 충돌, 서정성 충돌, 의인화 충돌)
- **info**: 참고 사항 (슬롯 겹침, 감정 이중 억제)

### 제어 원칙

의인화 같은 규칙은 **독립 토글이 아니라 시점(A축) 선택의 부산물**이다:
- A-05(공간 시점), A-06(사물 시점) 선택 시 의인화 금지가 자동으로 적용
- 문체적 수사로 허용하고 싶으면 B축/F축에서 미세 조정
- 빌드 순서(A→B)로 우선순위 해소: A축이 금지하면 B축이 허용해도 A축 우선

---

## 축별 슬롯 맵

| 축 | 건드리는 슬롯 | 위치 |
|---|---|---|
| **N** | `{A_*}`, `{B_*}`, `{C_*}`, `{D_*}`, `{F_*}` 전체 + static_overrides + preamble_overrides | 복합 (여러 모듈) |
| **A** | `{A_VOICE_POV_RATIO}`, `{A_VOICE_FID_STYLE}`, `{A_VOICE_STYLE_REF}`, `{A_PROSE_RHYTHM}`, `{A_PROSE_SENSORY}`, `{A_PROSE_DESCRIPTION}`, `{A_PROSE_CAUSALITY}`, `{A_PROSE_TIME_DENSITY}`, `{A_PROSE_PACING}`, `{A_PROSE_DWELL}`, `{A_PROSE_MEDITATIVE}`, `{A_PROSE_PHYSICAL_DISTANCE}` | MODULE_1_VOICE, MODULE_2_PROSE |
| **B** | `{B_TONE_TEMP}`, `{B_TONE_VOCAB}`, `{B_TONE_FID_GRAMMAR}`, `{B_TONE_ENDING}`, `{B_TONE_DIALOGUE_TAG}` | MODULE_7_TONE |
| **C** | `{C_NARR_GENRE_VARS}`, `{C_DLG_GENRE_STYLE}` | MODULE_4_NARRATIVE, MODULE_5_DIALOGUE |
| **D** | `{D_PROSE_MOOD}` | MODULE_2_PROSE |
| **E** | `{E_NARR_SETTING_VARS}` | MODULE_4_NARRATIVE |
| **F** | `{F_COG_QUIRKS}`, `{F_SPEC_EXTRA}` | MODULE_3_COGNITIVE, MODULE_6_SPECIFICITY |
| **G** | `{G_COG_DISTANCE}`, `{G_NARR_INITIATIVE}`, `{G_NARR_NPC_NETWORK}`, `{G_DLG_INCOMPLETE}` | MODULE_3_COGNITIVE, MODULE_4_NARRATIVE, MODULE_5_DIALOGUE |

---

## 모듈 완성 상태

| 축 | ID | 이름 | 상태 |
|---|---|---|---|
| **Config** | UCC-00~02 | 유저 캐릭터 제어 | ✅ 완성 |
| **N** | N-00 | 사용하지 않음 | ✅ 완성 |
| **N** | N-01 | 동화/우화 | ✅ 완성 |
| **N** | N-02 | 서간체 | ✅ 완성 |
| **N** | N-03 | 시간 루프 | ✅ 완성 |
| **N** | N-04 | 무협 | ✅ 완성 (별도 PR 진행 중) |
| **A** | A-00 | 사용하지 않음 | ✅ 완성 |
| **A** | A-01 | 1인칭 체험형 | ✅ 완성 |
| **A** | A-02 | 2인칭 관찰 밀착형 | ✅ 완성 |
| **A** | A-03 | 3인칭 제한 관찰자 | ✅ 완성 (기본값 사용) |
| **A** | A-04 | 전지적 작가 시점 | ✅ 완성 |
| **A** | A-05 | 공간 시점 | ✅ 완성 |
| **A** | A-06 | 사물 시점 | ✅ 완성 |
| **B** | B-00 | 사용하지 않음 | ✅ 완성 |
| **B** | B-01 | 건조체 | ✅ 완성 |
| **B** | B-02 | 서정체 | ✅ 완성 |
| **B** | B-03 | 구어체 | ✅ 완성 |
| **B** | B-04 | 만연체 | ✅ 완성 |
| **B** | B-05 | 간결체 | ✅ 완성 |
| **B** | B-06 | 냉소체 | ✅ 완성 |
| **B** | B-07 | 고풍체 | ✅ 완성 |
| **C** | — | (없음) | ❌ 미구현 |
| **D** | — | (없음) | ❌ 미구현 |
| **E** | — | (없음) | ❌ 미구현 |
| **F** | — | (없음) | ❌ 미구현 |
| **G** | — | (없음) | ❌ 미구현 |

---

## 다음 할 일 (우선순위 순)

- [x] **[HIGH] B축 포맷 정비**: `override_mode` + `module_overrides.MODULE_6_STYLE` 구조 → `operations` + `check_operations` 구조로 전환. `{B_TONE_TEMP}`, `{B_TONE_VOCAB}`, `{B_TONE_FID_GRAMMAR}`, `{B_TONE_ENDING}`, `{B_TONE_DIALOGUE_TAG}` 슬롯 연결. ✅ 완료
- [x] **[HIGH] catalog.json에 B축 모듈 등록**: B-00~B-07 등록 ✅ 완료
- [x] **[HIGH] N-04 무협 서사 모드 추가**: 김용식 강호 서사. 별도 PR 진행 중
- [x] **[HIGH] Config 시스템 신설**: 축과 독립적인 빌드 레벨 설정. 유저 캐릭터 제어(UCC-00~02) 추가 ✅ 완료
- [ ] **[HIGH] 기존 하드코딩 마이그레이션**: N-01~N-04의 유저 캐릭터 관련 하드코딩된 지시를 UCC config로 위임. `master-rules.json`의 `godmoding_rule`을 config 의존으로 전환
- [ ] **[MED] 추가 Config 검토**: NSFW 등급 제어, 출력 길이 제어 등 축과 독립적인 설정 후보 검토
- [ ] **[MED] C축 장르 모듈 작성**: `{C_NARR_GENRE_VARS}`, `{C_DLG_GENRE_STYLE}` 슬롯 사용
- [ ] **[MED] D축 분위기 모듈 작성**: `{D_PROSE_MOOD}` 슬롯 사용
- [ ] **[MED] F축 특별 요소 모듈 작성**: `{F_COG_QUIRKS}`, `{F_SPEC_EXTRA}` 슬롯 사용
- [ ] **[LOW] E축 배경 모듈 작성**: `{E_NARR_SETTING_VARS}` 슬롯 사용
- [ ] **[LOW] G축 상호작용 모듈 작성**: `{G_*}` 슬롯 사용
- [ ] **[LOW] combinations.json 채우기**: 권장/비권장 조합 등록
- [ ] **[LOW] N-05 극본체 추가**: 대사 중심 서사 모드
- [ ] **[LOW] N-06 웹소설체 추가**: 장르 관습 기반 복합 모드
- [ ] **[LOW] presets/ 채우기**: 인기 조합 저장

---

## 모듈 포맷 설명

### Config 포맷

Config는 `configs/` 디렉토리에 위치하며, 축과 독립적으로 빌드의 근본 규칙을 결정한다:

```json
{
  "config": "config_key",
  "type": "mutex",
  "build_priority": -1,
  "modes": [
    {
      "id": "UCC-01",
      "name": "RP 모드",
      "one_liner": "UI 한줄 설명",
      "operations": { },
      "injections": {
        "preamble_core_directives_add": ["core_directives에 추가할 항목"],
        "static_MODULE_1_VOICE_add": ["MODULE_1_VOICE static에 추가할 항목"],
        "master_rules_godmoding_override": "godmoding_rule 교체값 (null이면 비활성화)"
      },
      "check_operations": [ ]
    }
  ]
}
```

**Config는 축(axis)과 다르게:**
- `injections` 필드를 사용하여 core/, master-rules 레벨에 직접 주입
- `operations`도 사용 가능하지만 주로 `injections`으로 작동
- `build_priority: -1`로 모든 축보다 먼저 적용

### N축 모듈 포맷

N축은 **복합 문체**를 다루므로, A~G 여러 축의 슬롯을 동시에 건드린다. 추가 필드:

```json
{
  "id": "N-01",
  "name": "동화/우화",
  "one_liner": "UI에 표시될 한줄 설명",
  "persona": "서술자 페르소나 (해당 있는 경우)",
  "preamble_overrides": {
    "title": "변경할 preamble 제목",
    "naming_rule": "추가 명명 규칙",
    "core_directives_add": ["추가할 core directive"],
    "narrator_stance": "서술자 입장 (서간체 등)"
  },
  "operations": {
    "{A_VOICE_POV_RATIO}": { "mode": "REPLACE", "value": "..." },
    "{B_TONE_TEMP}": { "mode": "REPLACE", "value": "..." },
    "{C_NARR_GENRE_VARS}": { "mode": "REPLACE", "value": "..." }
  },
  "check_operations": [
    { "mode": "ADD", "check": { "id": "CHK-N01-01", "..." : "..." } },
    { "mode": "REPLACE", "target_id": "CHK-04", "reason": "...", "check": { "..." : "..." } }
  ],
  "static_overrides": {
    "MODULE_1_VOICE": { "static": ["교체할 static 배열"] },
    "MODULE_7_TONE": { "static": ["교체할 static 배열"] }
  },
  "master_guide_delta": { "key": "추가 가이드라인" },
  "known_conflicts": [
    { "with": "A-01", "reason": "...", "resolution": "..." }
  ]
}
```

**A~G 축과의 차이:**
- `operations`에 `{A_*}`, `{B_*}`, `{C_*}`, `{D_*}`, `{F_*}` 등 **여러 접두사의 슬롯이 혼재**
- `preamble_overrides`: default-template의 preamble 필드 중 변경이 필요한 것만 교체
- `static_overrides`: 특정 모듈의 static 배열을 교체해야 할 때 사용
- `persona`: 동화처럼 서술자 페르소나가 있는 경우 추가

### A~G축 모듈 포맷

A~G축은 **단일 차원** 조정이므로, 자기 접두사 슬롯만 건드린다:

```json
{
  "id": "A-01",
  "name": "1인칭 체험형",
  "one_liner": "UI에 표시될 한줄 설명",
  "operations": {
    "{A_VOICE_POV_RATIO}": { "mode": "REPLACE", "value": "..." },
    "{A_PROSE_RHYTHM}": { "mode": "REPLACE", "value": "..." }
  },
  "check_operations": [
    { "mode": "ADD", "check": { "id": "CHK-A01-01", "category": "pov", "rule": "...", "source": "A-01" } },
    { "mode": "REPLACE", "target_id": "CHK-40", "reason": "...", "check": { "..." : "..." } }
  ],
  "master_guide_delta": { "..." : "..." },
  "known_conflicts": [ "..." ]
}
```

**오버레이 모드:**

| 모드 | 설명 | 용도 |
|---|---|---|
| REPLACE | 기본값을 완전히 대체 | A/N축(MUTEX), 기본값과 양립 불가한 경우 |
| APPEND | 기본값 뒤에 내용 추가 | B~G축(COMBINABLE)에서 정보를 덧붙일 때 |
| COEXIST | 기본값과 나란히 병렬 배치 | 기존 규칙 유지하면서 추가 규칙을 병렬로 둘 때 |

**Self-Check 병합 모드:**

| 모드 | 설명 |
|---|---|
| ADD | 새 검수 항목 추가 |
| REPLACE | 기존 항목(target_id)을 새 버전으로 교체 |
| REMOVE | 기존 항목(target_id) 제거 |

---

## 설계 결정 기록

### Config vs Axis 판단 기준

새로운 설정을 추가할 때, 축(axis)으로 넣을지 config로 넣을지 판단하는 기준:

| 질문 | Config | Axis |
|---|---|---|
| 특정 슬롯만 교체하는가? | ❌ | ✅ |
| 모든 축에 걸쳐 작동하는가? | ✅ | ❌ |
| 빌드 규칙 자체를 바꾸는가? | ✅ | ❌ |
| core_directives/master-rules를 건드리는가? | ✅ | ❌ |
| 문체/장르/분위기에 따라 달라지는가? | ❌ | ✅ |

### 유저 캐릭터 제어를 Config로 만든 이유

- 모든 N축 모듈(동화, 서간체, 시간 루프, 무협)에서 동일하게 적용되어야 함
- 모든 A축 시점에서 동일하게 적용되어야 함
- `master-rules.json`의 `godmoding_rule`을 직접 교체해야 함
- 슬롯 교체가 아니라 빌드 규칙 자체의 변경

### 향후 Config 후보 (검토 필요)

| 후보 | 설명 | Config 적합성 |
|---|---|---|
| NSFW 등급 제어 | SFW/NSFW/R18 등급 설정 | ✅ 높음 — 모든 축에 걸쳐 어휘·묘사 수위 결정 |
| 출력 길이 제어 | 짧게/보통/길게 | ⚠️ 중간 — B축과 겹칠 수 있음 |
| 언어 설정 | 한국어/영어/일본어 | ✅ 높음 — 모든 축에 걸쳐 언어 결정 |

---

## 알려진 문제

- **하드코딩 마이그레이션 미완료**: N-01~N-04의 유저 캐릭터 관련 하드코딩된 지시가 아직 UCC config로 이관되지 않음. 현재는 UCC config와 기존 하드코딩이 공존하는 상태.
- **`master-rules.json`의 `godmoding_rule`**: UCC-00(사용안함) 선택 시 기존 godmoding_rule이 그대로 적용됨. UCC-02(사칭) 선택 시 이 규칙을 null로 오버라이드해야 하는데, 빌더가 이를 처리하는 로직이 아직 명세되지 않음.

---

## 변경 이력

| 버전 | 내용 |
|---|---|
| 초기 | A-00~A-06, B-00~B-07 작성. catalog.json에 A축만 등록 |
| N축 추가 | **N축(서사 모드) 신설**: N-00(사용하지 않음), N-01(동화/우화), N-02(서간체). `default-template.json`에 `build_order` 추가. A-07 서간체를 N-02로 이동. catalog.json에 N축 등록 |
| B축 재작성 | **B축 전면 재작성**: B-00~B-07을 `operations` + `check_operations` + `master_guide_delta` + `known_conflicts` 표준 포맷으로 재작성. `override_mode`/`preamble_overrides`/`module_overrides` 비표준 구조 제거. `{B_TONE_TEMP}`, `{B_TONE_VOCAB}`, `{B_TONE_FID_GRAMMAR}`, `{B_TONE_ENDING}`, `{B_TONE_DIALOGUE_TAG}` 슬롯 연결. catalog.json에 B-00~B-07 등록 |
| N-03 추가 | **N-03(시간 루프) 신설**: 반복 서사 복합 문체. `temporal_mode: "loop"` trait 값 추가. catalog.json에 N-03 등록 |
| N-04 추가 | **N-04(무협) 신설**: 김용식 강호 서사 복합 문체. 무공 체계, 강호 생태계, 초식 리듬 시스템. 별도 PR 진행 중 |
| Config 신설 | **Config 시스템(0계층) 신설**: 축과 독립적인 빌드 레벨 설정. `configs/` 디렉토리, `meta/config-schema.json` 추가. 첫 번째 config으로 유저 캐릭터 제어(UCC-00~02) 추가. `default-template.json`의 `build_order`에 `"configs"` 항목 추가 |
