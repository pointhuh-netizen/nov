# nov

SillyTavern Modular Prompt System

## 모듈 완성 상태

| 축 | 모듈 ID | 모듈명 | 상태 |
|---|---|---|---|
| **A** | A-00~A-06 | 사용안함, 1인칭~사물 시점 | ✅ 완성 |
| **S** | S-00~S-14 | 사용안함, 동화적 서술, 무협적 서술, 서간체, 극본체, 기록체, 구술체, 회상체, 몽타주, 의식의 흐름, 신뢰할 수 없는 서술자, 다성 서술, 일기체, 실시간 중계체, 사관 기록체 | ✅ 완성 |
| **B** | B-00~B-08 | 건조체~사극투 | ✅ 완성 |
| **C** | C-01~C-05 | 궁정 정치, 추리 색채, 동화/우화, 무협, 심리 스릴러 | ✅ 완성 |
| **D** | D-01 | 감각적 일상 | ✅ 완성 |
| **E** | E-01, E-02 | 전근대 궁정, 강호/무림 세계 | ✅ 완성 |
| **F** | F-01~F-03 | 비인간 종족 체계, 마법 체계, 기술 레벨 오버라이드 | ✅ 완성 |
| **G** | — | (없음) | ❌ 미구현 |

## 아키텍처

```
sillytavern-style-engine/
├── core/
│   ├── master-rules.json
│   └── default-template.json
├── axes/
│   ├── axis-a-pov.json             ← A축: 시점. A-00~A-06
│   ├── axis-s-narration.json       ← S축: 서술 방식. S-00~S-14
│   ├── axis-b-tone.json            ← B축: 어조·어휘. B-00~B-08
│   ├── axis-c-genre.json           ← C축: 장르. C-01~C-05
│   ├── axis-d-mood.json            ← D축: 분위기. D-01
│   ├── axis-e-setting.json         ← E축: 배경. E-01~E-02
│   ├── axis-f-special.json         ← F축: 특별 요소. F-01~F-03
│   └── axis-g-interaction.json     ← G축: 상호작용. 비어있음
├── configs/
│   ├── user-character-control.json
│   └── nsfw-rating.json
└── meta/
    ├── catalog.json
    ├── combinations.json
    ├── config-schema.json
    └── trait-schema.json
```

## 빌드 순서

```
configs → A → S → B → C → D → E → F → G
```

## 다음 할 일

- [x] **[HIGH] N축 해체**: 3계층(Config→N→A~G) → 2계층(Config→A~G)으로 단순화. ✅ 완료
- [x] **[HIGH] C-05 심리 스릴러 추가**: 표면 아래의 전쟁. ✅ 완료
- [x] **[MED] D축 분위기 모듈 작성**: D-01 감각적 일상 ✅ 완료
- [ ] **[LOW] G축 상호작용 모듈 작성**: `{G_NARR_INITIATIVE}`, `{G_DLG_INCOMPLETE}` 슬롯 사용

## 변경 이력

| 변경 | 내용 |
|---|---|
| S축 분리 | **S축(서술 방식) 신설**: A-07(동화적 서술)→S-01, A-08(무협적 서술)→S-02, A-09(서간체)→S-03. A축은 순수 시점(A-00~A-06)만 유지. 빌드 순서 `configs → A → S → B → C → D → E → F → G`로 업데이트. |
| N축 해체 | **N축(서사 모드) 삭제**: N-01(동화/우화)→A-07+C-03, N-02(서간체)→A-09, N-04(무협)→A-08+C-04+E-02. N-03(시간 루프)은 삭제. 3계층 → 2계층(Config→A~G) 단순화. C-05 심리 스릴러 신설 |
| D축 추가 | **D-01(감각적 일상) 신설**: 사건 없이 분위기와 감각이 서사를 이끄는 일상 서사 모듈. |