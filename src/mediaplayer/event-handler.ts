export class EventHandler{

    private elem: DocumentAndElementEventHandlers;
    private events: EventItem[];

    public constructor(elem: DocumentAndElementEventHandlers){
        this.elem = elem;
        this.events = [];
    }

    public addEventWithListeners(event: string, listeners: Listener[]): void {
        const eventFn: EventListener = () => {
            listeners.forEach((item) => {
                item.update(new Event(event));
            });
        }

        this.addSingleEventListener(event, eventFn);
    }

    public addSingleEventListener(event: string, listener: EventListener): void {
        this.elem.addEventListener(event, listener);
        this.events.push({name: event, handler: listener});
    }

    public addEvents(events: string[], listeners: Listener[]): void {
        events.forEach((item) => {
            this.addEventWithListeners(item, listeners);
        });
    }

    public removeAll(): void {
        this.events.forEach((event) =>{
            this.elem.removeEventListener(event.name, event.handler);
        });
    }
}

interface EventItem {
    name: string;
    handler: EventListener;
}

export interface Listener {
    update: EventListener;
}