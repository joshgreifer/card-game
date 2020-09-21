
// Playing Card
class Card extends HTMLElement {
    private static top_z_index = 0;
    private static  readonly deck_img = `cards_deck.svg`;
    private static  readonly back_img = `card_back.svg`;

    private static readonly original_grid_x = 390;
    private static readonly original_grid_y = 570;
    private static readonly original_width = 360;
    private static readonly original_height = 540;
    private static readonly original_origin_x = 30;
    private static readonly original_origin_y = 30;

    private static readonly scale = 1/3;

    public static readonly width = Math.round(Card.original_width * Card.scale);
    public static readonly height = Math.round(Card.original_height * Card.scale);

    static readonly SuitNames: string[] = ['Spades','Hearts','Diamonds','Clubs']
    static readonly SuitNamesShort: string[] = ['S','H','D','C']

    static readonly FaceNames: string[] = ['Ace','Two','Three','Four','Five','Six','Seven','Eight', 'Nine','Ten','Jack','Queen', 'King',]
    static readonly FaceNamesShort: string[] = ['A','2','3','4','5','6','7','8', '9','10','J','Q', 'K',]

    private _el!: HTMLDivElement;
    private _img_el!: HTMLImageElement;
    private _style!: HTMLStyleElement;

    public readonly suit: number = 0;
    public readonly face_value: number = 0;
    private _img_src!: string;
    private _raised: boolean = false;



    constructor(suit?: number, face_value? : number) {
        super();
        const shadow = this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'

        if (suit === undefined || face_value === undefined) {
            const name = this.hasAttribute('value') ? this.getAttribute('value') as string : '10H';
            // last char is suit
            const suit_match = name.match(/[CDHS]$/i)
            if (suit_match)
                this.suit = Card.SuitNamesShort.indexOf(suit_match[0])

            const fv_match = name.match(/^[^CDHS]/i)
            if (fv_match)
                this.face_value = Card.FaceNamesShort.indexOf(fv_match[0])
        } else {
            this.suit = suit;
            this.face_value = face_value;
        }

        shadow.append( this.Style, this.Element);

    }

    private _drop_callback?: (els: Element[]) => void;

    private _selected: boolean = false;

    set DropCallback(cb: (els: Element[]) => void )  {
        this._drop_callback =  cb;
    }

    get Name() : string {
        return `${Card.FaceNames[this.face_value]} of ${Card.SuitNames[this.suit]}`;

    }
    get Raised() : boolean { return this._raised;  }
    set Raised(raised) {

        this._raised = raised;

        const img_el = this.ImgElement;

        if (raised) {

            img_el.classList.add('raised');
        } else {
            img_el.style.zIndex = '';
            img_el.classList.remove('raised')
        }
    }

    get Selected() : boolean { return this._selected;  }
    set Selected(selected) {

        this._selected = selected;

        const img_el = this.Element;

        if (selected) {

            img_el.style.zIndex = (++Card.top_z_index).toFixed(0);
            img_el.classList.add('selected');
        } else {
            img_el.style.zIndex = '';
            img_el.classList.remove('selected')
        }
    }

    get ImgElement() : HTMLImageElement {
        return this._img_el;
    }

    private _face_down: boolean = false;
    get FaceDown() : boolean { return this._face_down; }
    set FaceDown(face_down: boolean) { this._face_down = face_down;  this._img_el.src = face_down ?  Card.back_img : this._img_src; }

    static get observedAttributes() : string[] { return ['face-down']}

    attributeChangedCallback(name: string, oldValue : any, newValue: any) {
        console.log('Custom square element attributes changed.');
        switch (name) {
            case 'face-down':
                this.FaceDown = newValue;
        }
    }

    get Element() : HTMLDivElement {
        if (this._el === undefined) {
            const cw = Card.original_width;
            const ch = Card.original_height;
            const card_x = Card.original_origin_x + Card.original_grid_x *  this.face_value;
            const card_y = Card.original_origin_y + Card.original_grid_y *  this.suit;

            const el = <HTMLDivElement>document.createElement('div');
            const img_el = <HTMLImageElement>document.createElement('img');
            img_el.src =  `${Card.deck_img}#svgView(viewBox(${card_x} ${card_y}, ${cw}, ${ch}))`;
            img_el.width = Card.width;
            img_el.height = Card.height;

            el.appendChild(img_el);
            const this_ = this;

            el.className = 'card';

            // https://stackoverflow.com/questions/9334084/moveable-draggable-div
            el.addEventListener('mousedown',  (e: MouseEvent) => {
                let dragged = false;

                const face_down = this_.FaceDown;

                const offsetX = e.clientX - parseInt(window.getComputedStyle(el).left);
                const offsetY = e.clientY - parseInt(window.getComputedStyle(el).top);

                if (e.getModifierState('Control'))
                    this_.FaceDown = false;

                if (e.getModifierState('Shift'))
                    this_.Selected =  !this_.Selected;

                if (e.getModifierState('Alt'))
                    this_.Raised =  !this_.Raised;

                function drag(e: MouseEvent) {
                    if (!dragged) {
                        dragged = true;
                    }
                    el.style.top = (e.clientY - offsetY) + 'px';
                    el.style.left = (e.clientX - offsetX) + 'px';
                }

                function dragEnd(e: MouseEvent) {

                    window.removeEventListener('mousemove', drag);
                    window.removeEventListener('mouseup', dragEnd);
                    // el.style.top = (e.clientY - offsetY) + 'px';
                    // el.style.left = (e.clientX - offsetX) + 'px';
                    el.style.top = el.style.left = '';
                    if (dragged) {
                        const droppedElements = document.elementsFromPoint(e.x, e.y);

                        if (this_._drop_callback && droppedElements !== null)
                            this_._drop_callback(droppedElements);

                    }

                    this_.FaceDown = face_down;
                }

                window.addEventListener('mousemove', drag);
                window.addEventListener('mouseup', dragEnd);
            });
            this._el = el;
            this._img_el = img_el;
            this._img_src = img_el.src;
        }
        return this._el;
    }

    get Style(): HTMLStyleElement {
        if (this._style === undefined) {
            const style = document.createElement('style');
            style.textContent = `
       .card {
            position: relative;
            margin: 10px;
        }

        .card img {
            -webkit-user-drag: none;
            -khtml-user-drag: none;
            -moz-user-drag: none;
            -o-user-drag: none;
            user-drag: none;
         }
        .card img.raised {
            border-radius: 10px;
            box-shadow: 20px 20px 0 rgba(0, 0, 0, 0.3);
            position: relative;
            left: 2px;
            top: -20px;

        }
        .card.selected {
            border-radius: 10px;
            box-shadow: 0 0 5px #ff6f00;
        }
            `;
            this._style = style;


        }
        return this._style;
    }

}

customElements.define('playing-card', Card);


// class Cards extends Array<Card> {
//
//     static readonly SZ = 52;
//
//     shuffle: () => void;
//
//     constructor(...cards: Card[]) {
//         super(...cards);
//
//         this.shuffle = () => {
//             // Knuth shuffle
//             for (let i = this.length; i > 0;) {
//                 const j = Math.floor(Math.random() * i);
//                 --i;
//                 const tmp = this[i];
//                 this[i] = this[j];
//                 this[j] = tmp;
//             }
//         }
//     }
// }
//
// class Deck extends Cards {
//     constructor() {
//         super();
//         for (let suit = 0; suit < Card.SuitNames.length; ++suit)
//             for (let value = 0; value < Card.FaceNames.length; ++value) {
//                 this.push(new Card(suit, value));
//             }
//     }
//
// }


/*
A set of cards (e,g, a whole deck, a tableau, a hand) sorted and grouped.
The 'layout' property controls how the stock appears:
'fan':
'tableau'




 */
class Stock extends HTMLElement {
    private _el!: HTMLDivElement;
    private _style!: HTMLStyleElement;


    constructor(...cards: Card[]) {
        super();
        const shadow = this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'


        const this_ = this;

        const observer = new MutationObserver(() => {
            const a: Card[] = Array.from(this_.Element.childNodes) as Card[];

        });
        observer.observe(this.Element, { childList: true });
        shadow.append( this.Style, this.Element);
    }

    get Element() : HTMLDivElement {
        if (this._el === undefined) {
            const el = <HTMLDivElement>document.createElement('div');
            el.className = 'stock';
            el.append(...this.Cards);
            this._el = el;
        }
        return this._el;
    }

    Add(...cards: Card[]) {
        this.Element.append(...cards);
    }


    get Cards(): Card[] {
            return Array.from(this._el.childNodes) as Card[];
    }
    // Deal from top/beginning of stock
    Deal(num: number = 1) : Card | Card[] | undefined {
        if (num > this.Cards.length)
            num = this.Cards.length;
        if (num === 0)
            return undefined;

        const dealt_cards = this.Cards.splice(0, num);
        this.Element.innerHTML = '';
        this.Element.append(...this.Cards);
        return num == 1 ? dealt_cards[0] : dealt_cards;
    }


    get Style(): HTMLStyleElement {
        if (this._style === undefined) {
            const style = document.createElement('style');
            style.textContent = `
        .stock {
            border: 1px black;
            --card-spacing: 40px;
            --num-cards: 52;
            background-image: linear-gradient(#529610, #2f5609);
            display: grid;
            grid-template-columns: repeat(var(--num-cards), var(--card-spacing));
        }
`;
            this._style = style;


        }
        return this._style;
    }
}
customElements.define('card-stock', Stock);
