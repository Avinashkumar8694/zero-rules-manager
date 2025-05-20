# Dynamic Component Registration in Angular

## Implementation Strategy

1. **Node Interface Definition**
```typescript
interface DynamicNode {
  id: string;
  component: Type<any>;
  htmlTemplate?: string;
  attributesSchema: AttributeSchema[];
  onInit?: () => void;
  onDestroy?: () => void;
  onRender?: (element: HTMLElement) => void;
}

interface AttributeSchema {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  options?: string[];
  default?: any;
}
```

2. **Node Registry Service**
```typescript
@Injectable({providedIn: 'root'})
export class NodeRegistry {
  private nodes = new Map<string, DynamicNode>();

  registerNode(node: DynamicNode) {
    this.nodes.set(node.id, node);
    node.onInit?.();
    node.onRender?.(componentRef.location.nativeElement);
  }

  getNode(id: string): DynamicNode | undefined {
    return this.nodes.get(id);
  }
}
```

3. **Attribute Window Component**
```html
<div class="attribute-window">
  <ng-container *ngIf="selectedNode">
    <h3>{{selectedNode.id}} Properties</h3>
    <form [formGroup]="attributeForm">
      <div *ngFor="let attr of selectedNode.attributesSchema">
        <ng-container [ngSwitch]="attr.type">
  <input *ngSwitchCase="'string'" type="text" [formControlName]="attr.name">
  <input *ngSwitchCase="'number'" type="number" [formControlName]="attr.name">
  <select *ngSwitchCase="'select'" [formControlName]="attr.name">
    <option *ngFor="let opt of attr.options" [value]="opt">{{opt}}</option>
  </select>
</ng-container>
      </div>
    </form>
    <div #widgetContainer></div>
  </ng-container>
</div>
```

4. **Dynamic Component Loader**
```typescript
@Directive({selector: '[appDynamicWidget]'})
export class DynamicWidgetDirective {
  constructor(
    public viewContainerRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {}

  loadComponent(node: DynamicNode) {
    const factory = this.componentFactoryResolver.resolveComponentFactory(node.component);
    this.viewContainerRef.clear();
    const componentRef = this.viewContainerRef.createComponent(factory);
    node.onInit?.();
    node.onRender?.(componentRef.location.nativeElement);
  }
}
```

## Lifecycle Integration

```typescript
// Component registration example
this.nodeRegistry.registerNode({
  id: 'text-input',
  component: TextInputWidgetComponent,
  attributesSchema: [
    {name: 'placeholder', type: 'string', default: 'Enter text'},
    {name: 'maxLength', type: 'number'}
  ],
  onInit: () => console.log('Text input node initialized'),
  onDestroy: () => console.log('Text input node destroyed')
});
```

## Implementation Steps
1. Create core registry service with TypeScript interfaces
2. Implement attribute window component with dynamic form binding
3. Develop dynamic widget loader directive
4. Add lifecycle hooks to node configuration
5. Implement example nodes (text input, select, etc)
6. Add error handling for node registration/loading
7. Create template management service for HTML widgets
8. Implement DOM sanitization for dynamic templates

## Complete Example Implementation
```typescript
// Text Input Node Configuration
this.nodeRegistry.registerNode({
  id: 'text-input',
  component: TextInputWidgetComponent,
  htmlTemplate: `<div class="input-wrapper">
    <input type="text" [attr.placeholder]="config.placeholder">
  </div>`,
  attributesSchema: [
    {name: 'placeholder', type: 'string', default: 'Enter text'},
    {name: 'maxLength', type: 'number'}
  ],
  onInit: () => console.log('Text input node initialized'),
  onRender: (el) => el.classList.add('active-widget'),
  onDestroy: () => console.log('Text input node destroyed')
});

// Component Integration
@Component({
  selector: 'app-node-host',
  template: '<ng-container appDynamicWidget></ng-container>'
})
export class NodeHostComponent implements OnDestroy {
  constructor(
    private widgetDirective: DynamicWidgetDirective,
    private registry: NodeRegistry
  ) {
    const node = this.registry.getNode('text-input');
    if (node) {
      this.widgetDirective.loadComponent(node);
    }
  }

  ngOnDestroy() {
    const node = this.registry.getNode('text-input');
    node?.onDestroy?.();
  }
}
```