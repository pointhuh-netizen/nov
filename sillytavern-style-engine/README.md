# SillyTavern Style Engine

## 개요
SillyTavern용 모듈형 프롬프트 아키텍처. 기본틀(Default Template) 위에 축별 모듈을 오버레이하여 문체를 조합하는 시스템.

## 구조
2계층: Default Template + Axis Overlay
- **Layer 0**: `core/master-rules.json` — 어떤 문체를 선택해도 절대 변하지 않는 불변 규칙
- **Default Template**: `core/default-template.json` — 아무것도 선택하지 않아도 완전히 작동하는 기본 문체("외부 관찰형")
- **Axis Modules**: `axes/axis-*.json` — 축별 오버레이 모듈. 선택하면 기본틀의 해당 변수를 교체/추가/공존

## 축(Axis) 분류 (A~G)
| 축 | 이름 | 타입 | 설명 |
|---|---|---|---|
| A | 시점 · 서술방식 | MUTEX | 하나만 선택 가능 |
| B | 어조 · 어휘 | COMBINABLE | 다중 선택 가능 |
| C | 장르 | COMBINABLE | 다중 선택 가능 |
| D | 분위기 | COMBINABLE | 다중 선택 가능 |
| E | 배경 | COMBINABLE | 다중 선택 가능 |
| F | 특별 요소 | COMBINABLE | 다중 선택 가능 |
| G | 상호작용 | COMBINABLE | 다중 선택 가능 |

## 오버레이 모드
| 모드 | 설명 | 용도 |
|---|---|---|
| REPLACE | 기본값을 완전히 대체 | A축(MUTEX), 또는 기본값과 양립 불가능한 경우 |
| APPEND | 기본값 뒤에 내용 추가 | B~G축(COMBINABLE)에서 정보를 덧붙일 때 |
| COEXIST | 기본값과 나란히 병렬 배치 | 기존 규칙을 유지하면서 추가 규칙을 병렬로 둘 때 |

## Self-Check 병합 로직
축 모듈은 `check_operations`로 기본 검수 항목을 조작할 수 있음:
| 모드 | 설명 |
|---|---|
| ADD | 새 검수 항목 추가 |
| REPLACE | 기존 항목(target_id)을 새 버전으로 교체 |
| REMOVE | 기존 항목(target_id) 제거 |

빌드 시 중복 제거 및 충돌 해소가 자동으로 수행됨.

## 변수 네이밍 컨벤션
`{축_모듈약어_기능}` 패턴.
- 축 접두사: A_, B_, C_, D_, E_, F_, G_
- 예: `{A_VOICE_POV_RATIO}`, `{B_TONE_TEMP}`, `{C_NARR_GENRE_VARS}`

## 빌드 흐름
1. `default-template.json` 로드 (모든 슬롯에 기본값)
2. `master-rules.json` 로드 (항상 포함)
3. 유저 선택된 축 모듈의 `operations` 실행 (REPLACE/APPEND/COEXIST)
4. 축 모듈의 `check_operations` 실행 (ADD/REPLACE/REMOVE)
5. 충돌 검사 (`combinations.json` 참조)
6. 최종 프롬프트 조립 → SillyTavern에 주입

## 축 모듈 등록 시 필수 필드
```json
{
  "id": "A-01",
  "name": "모듈 이름",
  "one_liner": "UI에 표시될 한줄 설명",
  "operations": { ... },
  "check_operations": [ ... ],
  "master_guide_delta": { ... },
  "known_conflicts": [ ... ]
}
```

## 파일 구조
```
sillytavern-style-engine/
├── core/           ← 불변 규칙 + 기본틀
├── axes/           ← 축별 모듈 (데이터가 쌓이는 곳)
├── meta/           ← UI 카탈로그 + 조합 관리
└── presets/        ← 인기 조합 저장 (향후)
```
