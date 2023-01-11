<template>    
<fieldset role="radiogroup" class="flex flex-wrap gap-4 p-4 pt-0 rounded-md text-base focus-within:outline outline-base-content/20">
    <legend>
        <h4 class="mt-2" v-html="title" />
        <p class="text-sm" v-html="text" /> 
    </legend>    
    <div v-for="(op,i) in options" :key="'radio'+i">
        <input class="sr-only peer" type="radio" :value="op.value" :name="radioName" :id="radioName+op.value" @change="$emit('choose', $event.target.value)" >
        <label :class="op.color || 'peer-checked:ring-accent'" class="px-2 pb-1 border border-base-content rounded-2xl cursor-pointer peer-checked:ring-2 peer-checked:border-transparent" :for="radioName+op.value">
            {{op.text}}
        </label>
    </div>
</fieldset>
</template>
<script>
export default {
    props:{
        radioName:{type:String},
        title:{type:String},
        text:{type:String},
        options:{type:Array}
    },
    emits: ['choose'],
    methods:{
        labelClass(el){
            let custom = `peer-checked:${el}`
            let c = el ? custom : 'peer-checked:ring-accent'
            console.log(c)
            return c
        }
    }
}
</script>