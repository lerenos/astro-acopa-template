<template>
    <form id="simple-form" class="form-control gap-4 p-4 rounded-md bg-base-300 mb-4" @submit.prevent="beforeSub">
        <input name="name" type="text" placeholder="Your name" class="input w-full bg-base" v-model="formV.name" required/>
        <input name="email" type="email" placeholder="e-mail" class="input w-full" v-model="formV.email" required/>
        <textarea name="msg" placeholder="Your message" rows="6" class="textarea" v-model="formV.msg" required/>
        <button type="submit" class="btn btn-accent" :disabled="loading" v-text="loading?'Sending...':'Send'" />

        <!-- feedback -->
        <div class="alert alert-success shadow-lg" v-if="feedback?.status=='ok'">
            <div class="flex justify-between gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm" v-html="feedback.msg"/>
                <button class="btn btn-sm btn-ghost" @click="feedback.status=null">x</button>
            </div>
        </div>
        <div class="alert alert-error shadow-lg" v-if="feedback?.status=='error'">
            <div class="flex justify-between gap-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span class="text-sm" v-html="feedback.msg"/>
                <button class="btn btn-sm btn-ghost" @click="feedback.status=null">x</button>
            </div>
        </div>
        <!-- feedback end -->
        <!-- recaptcha -->
        <div id='recaptcha' class="g-recaptcha"
                data-sitekey="SUBSTITUIR POR PUBLIC KEY AQUI"
                data-callback="gSub"
                data-size="invisible"></div>
    </form>
</template>
<script>
export default {
    data(){
        return{
            formV:{
                name:null,
                email:null,
                sub: "Msg from the Resume Page",
                msg:null
            },
            callbackMsg:{
                ok: 'Your message was sent. Thanks!',
                error: 'Oops! There was an error submitting the form. Please try to contact me via social media links above. Thanks!'
            },
            feedback:null,
            loading:false,
        }
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
        dataSiteKey(){return import.meta.env.PUBLIC_RECAPTCHA}
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
            this.submitToServer(token).then(response => {
                let bdy = JSON.stringify(response)
                if (Number(response.status) !== 200) {
                   console.log(`mail API returned other code than 200. code: ${response.code} time: ${response.time}, response: ${bdy}`)
                   this.feedback = {status:'error', msg: `${this.callbackMsg.error} Reference: ${bdy}`}
                } else {
                    // console.log(response)
                    console.log(`All ok! Form submitted! time: ${response.time}, response: ${bdy}`)
                    this.feedback = {status: 'ok', msg: this.callbackMsg.ok}
                }
            }).then(() => {
                this.loading=false
                console.log('fim handle '+this.loading)
            }).catch( e => console.log('Erro de execução da promise em submitToServer '+e) )
        },
    }
}
</script>