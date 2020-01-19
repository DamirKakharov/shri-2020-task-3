# Задание 3

#### Что удалось сделать:

- исправил регулярное выражение
- добавил стили и скрипты из первого задания используя уже имеющийся `replace`, так как не нашел другого решения в краткие сроки

```javascript
panel.webview.html = previewHtml
.replace(/{{\s*(\w+)\s*}}/g, (str, key) => {
	switch (key) {
		case "content":
			return  html;
		case  'mediaPath':
			return  getMediaPath(context);
		case  'style':
			return  `<style>${style}</style>`;
		case  'script':
			return  `<script>${script}</script>`;
		default:
			return  str;
}
```

- здесь исправил `case Severity.Error:` на Error и поменял значение по дефолту

```javascript
switch (severity) {
  case Severity.Error:
    return DiagnosticSeverity.Error;
  case Severity.Warning:
    return DiagnosticSeverity.Warning;
  case Severity.Information:
    return DiagnosticSeverity.Information;
  case Severity.Hint:
    return DiagnosticSeverity.Hint;
  default:
    return DiagnosticSeverity.Warning;
}
```

- удалил эту проверку. Когда ошибка линтера исправляется, то остается подсвеченным код

```javascript
if (diagnostics.length) {
  conn.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}
```

- исправил настройки линтера. Добавил новые настройки и возможность менять тип ошибки
- выа
