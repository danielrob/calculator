// Fixture Setup
document.body.insertAdjacentHTML(
  'afterbegin',
  window.__html__['site/index.html']
    .match(/<body>[^]+<\/body>/g, "")[0]
    .replace(/<script>.*<\/script>/g,"")
);
