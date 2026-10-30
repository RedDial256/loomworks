---
'@red_dial/loom': minor
---

`Input` with date and time:

- `field`: the shared field logic (frame, value state, validation and the base of the ref), generic over the value type.
- `text-field`: `TextField`, the text implementation of `Input`, installable without the date picker.
- `date-time-input`: `DateTimeInput`, `date` / `time` / `datetime` on the native picker (`@react-native-community/datetimepicker`), with `minimum` / `maximum`, locale formatting and validation on `Date`.
- `input`: `Input` routes by `type` to one of the two, with props, value and ref typed by `type`.
