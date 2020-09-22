// Disable MS Edge (and probably Chrome) context menus in OSX

import {DeckStock, Stock} from "./Card";
import {CardGame} from "./game";
import {AddAlgorithms} from "./ArrayPlus";

AddAlgorithms();

customElements.define('card-stock', Stock);
customElements.define('deck-stock', DeckStock);
customElements.define('card-game', CardGame);

document.addEventListener('contextmenu', event => { event.preventDefault() })

document.querySelectorAll('.page-switcher').forEach((button) => {
    (<HTMLButtonElement>button).addEventListener('click', () => {switchToPage(button.getAttribute('page') || '') })
})

function switchToPage(page_id: string) {
    const pages = document.querySelectorAll('.page');
    for (const page of pages) {
        if (page.id === page_id)
            page.classList.remove('hidden');
        else
            page.classList.add('hidden');
    }
}
switchToPage('page-1');