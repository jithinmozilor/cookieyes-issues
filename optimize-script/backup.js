function _ckyRenderCategoryBar() {
  const categoryDirectList = `<div class="cky-category-direct" id="cky-category-direct" style="color:${cliConfig.options.colors[ckyActiveLaw].notice.textColor}"></div>`;
  document
    .getElementById("cky-consent")
    .getElementsByClassName("cky-bar-text")[0]
    .insertAdjacentHTML("afterend", categoryDirectList);
  for (const category of cliConfig.info.categories) {
    const categoryBarItem = `<div class="cky-category-direct-item"><span class="cky-category-direct-name" id="cky-category-direct-${category.name[selectedLanguage]}">${category.name[selectedLanguage]}</span></div>`;
    document
      .querySelector("#cky-consent #cky-category-direct")
      .insertAdjacentHTML("beforeend", categoryBarItem);
    _ckyCreateSwitches(category);
  }
}