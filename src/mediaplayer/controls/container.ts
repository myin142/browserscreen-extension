export class Container implements Controls {

    public node: HTMLElement;

    public set innerHTML(text: string){
        this.node.innerHTML = text;
    }

    public constructor(className = null, type = "DIV"){
        this.node = document.createElement(type);

        if(className != null)
            this.addClass(className);
    }

    public addClass(className: string): void {
        this.node.classList.add(className);
    }

    public append(child: Container): void {
        this.node.appendChild(child.node);
    }

    public appendMultiple(children: Container[]): void {
        children.forEach((child) => {
            this.append(child);
        });
    }
}

export interface Controls {
    node: HTMLElement;
}