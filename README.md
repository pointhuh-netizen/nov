# nov

SillyTavern Modular Prompt System

## 모듈 완성 상태

| 축 | 모듈 ID | 모듈명 | 상태 |
|---|---|---|---|
| **N** | N-01, N-02, N-03, N-04 | 동화/우화, 서간체, 시간 루프, 무협 | ✅ 완성 |
| **A** | A-01~A-06 | 1인칭~사물 시점 | ✅ 완성 |
| **B** | B-01~B-07 | 건조체~고풍체 | ✅ 완성 |
| **C** | C-01, C-02 | 궁정 정치/전쟁 서사, 추리 색채 | ✅ 완성 |
| **D** | D-01 | 감각적 일상 | ✅ 완성 |
| **E** | E-01 | 전근대 궁정 / 고대 세계 | ✅ 완성 |
| **F** | F-01~F-03 | 비인간 종족 체계, 마법 체계, 기술 레벨 오버라이드 | ✅ 완성 |
| **G** | — | (없음) | ❌ 미구현 |

## 아키텍처

```
sillytavern-style-engine/
├── core/
│   ├── master-rules.json
│   └── default-template.json
├── axes/
│   ├── axis-n-narrative-mode.json  ← N축: 서사 모드. N-01~N-04
│   ├── axis-a-pov.json             ← A축: 시점·서술방식. A-01~A-06
│   ├── axis-b-tone.json            ← B축: 어조·어휘. B-01~B-07
│   ├── axis-c-genre.json           ← C축: 장르. C-01~C-02
│   ├── axis-d-mood.json            ← D축: 분위기. 2계층. D-01
│   ├── axis-e-setting.json         ← E축: 배경. E-01
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

## 다음 할 일

- [x] **[MED] D축 분위기 모듈 작성**: D-01 감각적 일상 ✅ 완료
- [ ] **[LOW] G축 상호작용 모듈 작성**: `{G_NARR_INITIATIVE}`, `{G_DLG_INCOMPLETE}` 슬롯 사용

## 변경 이력

| 변경 | 내용 |
|---|---|
| D축 추가 | **D-01(감각적 일상) 신설**: 사건 없이 분위기와 감각이 서사를 이끄는 일상 서사 모듈. 16개 슬롯 REPLACE + 4개 MODULE static 추가 + 4개 자가검수 추가. catalog.json에 D-01 등록 |