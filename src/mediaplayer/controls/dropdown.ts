import { Container, Controls } from "./container";
import { Label } from "./label";

export class Dropdown extends Container implements Controls {

    currentLabel: Label;
    private format: (x: string) => string;

    constructor(className: string, items: any[], valueFn: () => any, updateFn: (x: any) => void, format: (x: string) => string = null){
        super(className);
        this.format = format;

        let show = false;

        // Create Dropdown
        let dropdown = new Container(null, "UL");
        items.forEach(value => {
            let itemNode = new Container(null, "LI");
            itemNode.innerHTML = this.formatValue(value);

            dropdown.append(itemNode);
        });
        dropdown.node.addEventListener("click", (e) => {
            let index = this.getIndexOfChild(e.target as Node);
            updateFn(items[index]);

            this.currentLabel.node.click();
        });

        // Set initial display of dropdown, so that state is known when hiding controls
        dropdown.node.style.display = "none";

        // Create Label for current Value
        this.currentLabel = new Label(null, () => {
            return this.formatValue(valueFn());
        });
        this.currentLabel.node.addEventListener("click", () => {
            dropdown.node.style.display = (show) ? "none" : "block";
            show = !show;
        });

        this.appendMultiple([this.currentLabel, dropdown]);
    }
    getIndexOfChild(child: Node): number{
        let i = 0;
        while( (child = child.previousSibling) != null )
            i++;

        return i;
    }
    formatValue(value: string): string{
        if(this.format != null){
            value = this.format(value);
        }
        return value;
    }
}