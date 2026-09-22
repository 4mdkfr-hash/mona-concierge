"use client";

import { useEffect } from "react";

/**
 * Тестовый стенд чат-виджета поддержки (проект cashman-support-widget).
 *
 * Виджет грузится ТОЛЬКО если в адресе есть ?chat=test — обычные посетители
 * mona-concierge.com и поисковики его не видят. Скрипт тянется с тестового
 * маршрута /widget-test.js, боевой cashman.casino при этом продолжает
 * использовать стабильный /widget.js на том же бэкенде.
 */
const WIDGET_SRC = "https://cashman-support-api.online/widget-test.js";
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
