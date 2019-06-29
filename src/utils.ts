export class Utils {

    public static addClassToAllParents(elem: Element, className: string): void {
        while(elem != null && elem.classList != undefined){
            elem.classList.add(className);
            elem = elem.parentNode as Element;
        }
    }

    public static removeAllClasses(cls: string): void {
        document.querySelectorAll(`.${cls}`).forEach(elem => {
            elem.classList.remove(cls);
        });
    }

}