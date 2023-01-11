<template>
    <form id="form" refs="form" class="form-control gap-4 p-4 rounded-md bg-base-200 dark:bg-base-300 mb-4" @submit.prevent="beforeSub">
        <input name="nome" type="text" placeholder="Seu nome" class="input w-full bg-base" v-model="formV.name" required/>
        <input name="email" type="email" placeholder="Seu e-mail" class="input w-full" v-model="formV.email" required/>

        <p class="text-sm p-2">
            No fim da página você pode enviar uma mensagem. Mas antes disso, você poderia responder algumas perguntas? 
            <br> <br>
            Elas são opcionais, mas vão nos ajudar a entender como nós podemos te ajudar 😉
        </p>
        <Radiogroup v-for="(r,i) in radiogroups" :key="'radiogroup'+i+r.name" :radioName="r.name" :title="r.title" :text="r.text" :options="r.options" @choose="v => formV[r.name] = v"/>

        <input name="assunto" type="text" placeholder="Assunto" class="input w-full" v-model="formV.sub" required/>
        <textarea name="msg" placeholder="Sua Mensagem" rows="6" class="textarea" v-model="formV.msg" required/>
        <button type="submit" class="btn btn-accent" :disabled="loading" v-text="loading?'Enviando...':'Enviar'" />
        <!-- feedback -->
        <div class="alert alert-success shadow-lg" v-if="feedback?.status=='ok'">
            <div class="flex justify-between gap-4 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm" v-html="feedback.msg"/>
                <button class="btn btn-sm btn-ghost" @click="feedback.status=null">x</button>
            </div>
        </div>
        <div class="alert alert-error shadow-lg" v-if="feedback?.status=='error'">
            <div class="flex justify-between gap-4 w-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm" v-html="feedback.msg"/>
                <button class="btn btn-sm btn-ghost" @click="feedback.status=null">x</button>
            </div>
        </div>
        <!-- feedback end -->
        <!-- recaptcha - chave pública vai aqui -->
        <div id='recaptcha' class="g-recaptcha"
                data-sitekey="SUBSTITUIR POR PUBLIC KEY AQUI"
                data-callback="gSub"
                data-size="invisible"></div>
    </form>
</template>
<script>
import Radiogroup from './radiogroup.vue'
export default {
    data(){
        let sim = {text:'👍 Sim',value:true,color:'peer-checked:ring-green-500'}
        let nao = {text:'❌ Não',value:false,color:'peer-checked:ring-red-500'}
        return{
            formV:{
                name:null,
                email:null,
                sub: null,
                msg:null,
                autonomo:null,
                faseempresa:null,
                temcnpj:null,
                temsite:null,
                temredes:null,
                usachatbot:null,
                fazads:null,
            },
            callbackMsg:{
                ok: 'Sua mensagem foi enviada. Obrigado!',
                error: 'Eita! Houve algum erro ao enviar. Por favor tente nos contatar pelas redes sociais'
            },
            feedback:null,
            loading:false,
            radiogroups:{
                autonomo:{
                    name:'autonomo',
                    title:'Você é um(a) profissional autônomo(a)?', 
                    text:'Ou seja, só você trabalha no seu negócio?',
                    options:[sim,nao]
                },
                faseempresa:{
                    name:'faseempresa',
                    title:'Qual a fase da sua empresa?',
                    text:'',
                    options:[
                        {text:'Ainda só na ideia',value:'ideia',color:''},
                        {text:'Pequena',value:'pequena',color:''},
                        {text:'Média',value:'media',color:''},
                        {text:'Grande',value:'grande',color:''},
                    ]
                },
                cnpj:{
                    name:'temcnpj',
                    title:'Tem CNPJ?', //(Se ≠ ideia:)
                    text:'',
                    options:[sim,nao]
                },
                site:{
                    name:'temsite',
                    title:'Tem Site?',
                    text:'',
                    options:[sim,nao]
                },
                redes:{
                    name:'temredes',
                    title:'Tem Redes Sociais?',
                    text:'',
                    options:[sim,nao]
                    // (se sim, brotam todos os campos, com logos ao lado)
                    // youtube (opcional)
                    // tiktok (opcional)
                    // instagram (opcional)
                    // facebook (opcional)
                    // linkedin (opcional)
                    // twitter (opcional)

                },
                chatbot:{
                    name:'usachatbot',
                    title:'Usa Chatbot?', //(se site ou redes = sim)
                    text:'',
                    options:[sim,nao]
                },
                ads:{
                    name:'fazads',
                    title:'Faz anúncios na internet?', //(se site ou redes = sim)
                    text:'',
                    options:[sim,nao]
                }
            }
        }
    },
    components:{
        Radiogroup
    },
    mounted() {
        let recaptchaScript = document.createElement('script')
        recaptchaScript.setAttribute('src', 'https://www.google.com/recaptcha/api.js')
        recaptchaScript.setAttribute('async',true)
        recaptchaScript.setAttribute('defer',true)
        document.head.appendChild(recaptchaScript)
        globalThis.gSub = (token) => {
            this.loading = true
            console.log('começando gSub. loading:'+this.loading)
            this.handleSubmit(token)
        }

    },
    computed:{
        dataSiteKey(){return import.meta.env.PUBLIC_RECAPTCHA} //não está funcionando em produção :(
    },
    methods: {
        beforeSub(){
            console.log('beforeSub')
            grecaptcha.execute()
        },
        submitToServer(token) {
            return new Promise((resolve, reject) => {
                fetch('/.netlify/functions/mail', {
                    method: "POST",
                    body: JSON.stringify({...this.formV, token})
                }).then(response => {
                    resolve(response);
                }).catch(err => {
                    reject(err);
                });
            })
        },
        handleSubmit(token) {
            console.log('inicio handle: '+this.loading)
            this.submitToServer(token).then(async (response) => {
                let r = await response.text()
                if (Number(response.status) !== 200) {
                   console.log(`mail API returned other code than 200. code: ${response.status}, response: ${r}`)
                   this.feedback = {status:'error', msg:this.callbackMsg.error}
                } else {
                    console.log(`All ok! Form submitted!, response: ${r}`)
                    this.feedback = {status: 'ok', msg: this.callbackMsg.ok}
                }
            }).then(() => {
                this.loading=false
                console.log('fim handle. loading:'+this.loading)
            }).catch( e => console.log('Erro de execução da promise em submitToServer '+e) )
        },
    }
}
</script>