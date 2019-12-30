export function deprecated(substituteFun?:string) {
    return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
        console.warn('')
        console.warn(`### DEPRECATED: ${propertyKey} ###`)
        if(substituteFun){
            console.warn(`You should use ${substituteFun}`)
        }
    }
}
