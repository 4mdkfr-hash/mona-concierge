"use client";

import { useEffect } from "react";

/**
 * Тестовый стенд чат-виджета поддержки (проект cashman-support-widget).
 *
 * Виджет грузится ТОЛЬКО если в адресе есть ?chat=test — обычные посетители
 * mona-concierge.com и поисковики его не видят. Пока виджет снят с
 * cashman.casino, здесь тестируется та же самая версия, что лежит на сервере.
 */
const WIDGET_SRC = "https://cashman-support-api.online/widget.js";
const API_URL = "https://cashman-support-api.online/api/chat";

export default function SupportWidgetTest() {
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("chat") !== "test") return;
    if (document.getElementById("support-widget-test")) return;

    const script = document.createElement("script");
    script.id = "support-widget-test";
    // cache-buster: каждая перезагрузка страницы тянет свежий widget-test.js,
    // иначе браузер показывает прошлую версию и правки выглядят «не приехавшими».
    script.src = `${WIDGET_SRC}?v=${Date.now()}`;
    script.async = true;
    script.setAttribute("data-api-url", API_URL);
    script.setAttribute("data-position", "right");
    document.body.appendChild(script);
  }, []);

  return null;
}
