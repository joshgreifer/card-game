


export class CardGame extends HTMLElement {
    private static readonly _template = `
<style>
       .barter-game-container {
            display: grid;
            grid-template-rows:minmax(100px, auto) minmax(100px, auto) minmax(100px, auto);
            grid-template-columns: auto 200px;
            grid-template-areas:
                    "therapist-stock therapist-status"
                    "auction-stock auction-item"
                    "subject-stock subject-status"
        ;
        }
           
</style>
           <div class="barter-game-container">
                <deck-stock face-down="true"  style="grid-area: auction-item"></deck-stock>

                <card-stock face-down="true" style="grid-area: therapist-stock">

                </card-stock>

                <card-stock layout="grid" style="grid-area: auction-stock">
                </card-stock>

                <card-stock face-down="false" style="grid-area: subject-stock">

                </card-stock>

            </div>

`;
    constructor() {
        super();
        const shadow = this.attachShadow({mode: 'open'});
        let template = document.createElement('template');
        template.innerHTML = CardGame._template;
        let templateContent = template.content.cloneNode(true);

        shadow.append(templateContent);
    }
}