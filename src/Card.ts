
// Playing Card
export class Card extends HTMLElement {
    private static top_z_index = 0;
    private static  readonly deck_img = `${__webpack_public_path__}/assets/img/cards_deck.svg`;
    private static  readonly back_img = `${__webpack_public_path__}/assets/img/card_back.svg`;

    private static readonly original_grid_x = 390;
    private static readonly original_grid_y = 570;
    private static readonly original_width = 360;
    private static readonly original_height = 540;
    private static readonly original_origin_x = 30;
    private static readonly original_origin_y = 30;

    private static readonly scale = 1/4;

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
        this.Element.setAttribute('name', `${Card.FaceNames[this.face_value]} of ${Card.SuitNames[this.suit]}`);
        shadow.append( this.Style, this.Element);

    }

    public DropIntoStockFromPoint(x: number, y: number, root:DocumentOrShadowRoot = document) : Stock | null {
        const droppedElements = root.elementsFromPoint(x, y);
        for (const drop_target of droppedElements)
            if(drop_target instanceof Stock) {
                drop_target.add(this);
                return drop_target;
            } else {
                const shadow = drop_target.shadowRoot;
                if (shadow !== null) {
                    const stock = this.DropIntoStockFromPoint(x,y, shadow);
                        if (stock !== null)
                            return stock;
                }

            }
        return  null;
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
            img_el.style.zIndex = `${++Card.top_z_index}`;
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

        if (selected)
            img_el.classList.add('selected');
        else
            img_el.classList.remove('selected')

    }

    get ImgElement() : HTMLImageElement {
        return this._img_el;
    }

    private _face_down: boolean = false;
    get FaceDown() : boolean { return this._face_down; }
    set FaceDown(face_down: boolean) {
        this._face_down = face_down;
        this._img_el.src = face_down ?  Card.back_img : this._img_src;
    }

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
            el.style.width = Card.width + 'px';
            el.style.height = Card.height + 'px';
            el.appendChild(img_el);
            const this_ = this;

            el.className = 'card';

            const select = (e: MouseEvent) => {
                this_.Selected =  !this_.Selected;
            }
            // https://stackoverflow.com/questions/9334084/moveable-draggable-div
           const dragStart =  (e: MouseEvent) => {
                let dragged = false;

                const face_down = this_.FaceDown;


                const offsetX = e.clientX - parseInt(window.getComputedStyle(el).left);
                const offsetY = e.clientY - parseInt(window.getComputedStyle(el).top);

                if (e.getModifierState('Control'))
                    this_.FaceDown = false;


                this_.Raised =  true;
                function dragging(e: MouseEvent) {
                    if (!dragged) {
                        dragged = true;
                    }
                    el.style.top = (e.clientY - offsetY) + 'px';
                    el.style.left = (e.clientX - offsetX) + 'px';
                }

                function dragEnd(e: MouseEvent) {

                    window.removeEventListener('mousemove', dragging);
                    window.removeEventListener('mouseup', dragEnd);
                    // el.style.top = (e.clientY - offsetY) + 'px';
                    // el.style.left = (e.clientX - offsetX) + 'px';
                    el.style.top = el.style.left = '';
                    this_.Raised = false;
                    this_.FaceDown = face_down;
                    if (dragged) {
                        this_.DropIntoStockFromPoint(e.x, e.y);
                    }


                }

                window.addEventListener('mousemove', dragging);
                window.addEventListener('mouseup', dragEnd);
            }

            const onMouseDown = (e: MouseEvent) => {
               if (e.getModifierState('Shift'))
                   select(e);
               else
                   dragStart(e);
            }

            el.addEventListener('mousedown', onMouseDown);

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
            box-shadow: 0 0 3px #ffffff;
        }
        
        /*.card:hover::after {*/
        /*    content: attr(name);*/
        /*    position: absolute;*/
        /*    left: 0;*/
        /*    bottom: 24px;*/
        /*    border: 1px #aaaaaa solid;*/
        /*    border-radius: 5px;*/
        /*    background-color: #ffffcc;*/
        /*    padding: 12px;*/
        /*    color: #000000;*/
        /*    font-size: 14px;*/
        /*    z-index: 1;*/
        /*    }*/
   
     
        
        .card.selected::after {
        content: attr(foo);
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            border: 1px #aaaaaa solid;
            border-radius: 10px;
            background-image: linear-gradient(rgba(255,255,255,0.0), rgba(255,111,0,0.9));
            padding: 12px;
            color: #000000;
            font-size: 14px;
   
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

class Deck extends Array<Card> {
    shuffle: () => Deck;

    constructor() {
        super();
        for (let suit = 0; suit < Card.SuitNames.length; ++suit)
            for (let value = 0; value < Card.FaceNames.length; ++value) {
                this.push(new Card(suit, value));
            }
        this.shuffle = () => {
            const cards = this;
            // Knuth shuffle
            for (let i = cards.length; i > 0;) {
                const j = Math.floor(Math.random() * i);
                --i;
                const tmp = cards[i];
                cards[i] = cards[j];
                cards[j] = tmp;
            }
            return this;
        }
    }


}


/*
A set of cards (e,g, a whole deck, a tableau, a hand) sorted and grouped.
The 'layout' property controls how the stock appears:
'fan':
'tableau'




 */
export class Stock extends HTMLElement {
    protected _el!: HTMLDivElement;
    protected _style: HTMLStyleElement;

    sort: (by: string[]) => void;
    add: (...cards: Card[]) => void;
    deal: (to: Stock, ...cards: Card[]) => void;


    constructor(layout: string = 'fan', ...cards: Card[]) {
        super();
        const shadow = this.attachShadow({mode: 'open'}); // sets and returns 'this.shadowRoot'
        const el = <HTMLDivElement>document.createElement('div');
        const style = document.createElement('style');
        // noinspection CssInvalidPropertyValue
        style.textContent = `
        .fan {
            height: ${Card.height + 20}px;
            border: 1px black;
            --card-spacing:${(Card.width / 3).toFixed(0)}px;
            --num-cards:13;
            background-image: linear-gradient(#529610, #2f5609);
            display: grid;
            grid-template-columns: repeat(var(--num-cards), var(--card-spacing));
        }
        .fan.horizontal {}
        
        .fan.vertical {
            width: ${Card.width + 20}px;
            border: 1px black;
            --card-spacing:${(Card.width / 3).toFixed(0)}px;
            --num-cards:13;
            background-image: linear-gradient(#529610, #2f5609);
            display: grid;
            grid-template-rows: repeat(var(--num-cards), var(--card-spacing));
        }
        .pile {
            height: ${Card.height + 20}px;
            border: 1px black;
            --card-spacing: 2px;
            --num-cards: 52;
            background-image: linear-gradient(#529610, #2f5609);
            display: grid;
            grid-template-columns: repeat(var(--num-cards), var(--card-spacing));
        }
        
        .grid {
            background-image: linear-gradient(#529610, #2f5609);
            display: grid;
            grid-template-columns: repeat(13, auto);
            grid-template-rows: repeat(4, auto);
        }

`;
        // Override layout value if specified in 'layout' attribute
        const layout_attr = this.getAttribute('layout');
        if (layout_attr !== null)
            layout = layout_attr;

        el.classList.add(...layout.split(' '));

        const face_down = this.getAttribute('face-down');

        this.sort = (by: string[] = ['V', 'S']) => {}

        this.add = (...cards: Card[]) => {

            el.append(...cards);
            if (face_down !== null)
                for (const c of cards)
                    c.FaceDown = (face_down === 'true');
        }

        this.deal = ( to: Stock, ...cards: Card[]) => {
            if (cards.length === 0)
                cards = [el.firstChild as Card];
            to.add(...cards);
        }


        // Append cards in ctor parameters to container div
        this.add(...cards);

        // Append children of this node which are Cards to container div
        cards = Array.from(this.querySelectorAll('playing-card'))
        this.add(...cards);

        shadow.append( style, el);

        this._el = el;
        this._style = style;

    }


    get Cards(): Card[] {
        return Array.from(this._el.childNodes) as Card[];
    }

    set Cards( cards) {
        this._el.innerHTML = '';
        this._el.append(...cards);
    }

}

export class DeckStock extends Stock {
    constructor() {
        super('pile', ...new Deck().shuffle());

    }
}
