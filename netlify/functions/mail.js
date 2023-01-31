const sgMail = require('@sendgrid/mail');
const axios = require('axios');
const sanitizeHtml = require('sanitize-html');


sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const headers = {
    // "Access-Control-Allow-Origin" : "https://seusite.com.br", // para permitir chamada apenas a partir do url do seu site
};

const { RECAPTCHA_SECRET } = process.env;
const RECAPTCHA_VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify';

function isHuman(token) {
  const endpoint = `${RECAPTCHA_VERIFY_URL}?response=${token}&secret=${RECAPTCHA_SECRET}`;
  return axios.post(endpoint)
    .then(({ data }) => {
      return data.success
    } )
    .catch(e => console.log(e))
}
  
// export default async function handler(event, response)
// const handler = async (event) => 
exports.handler = async function(event, context) {
  // only allow POST requests
  // console.log(event.httpMethod)
  if (event.httpMethod !== "POST") {
    // return response.status(410).send(`Only POST requests allowed. ${event.httpMethod} request was made.`)
    return {statusCode:410, body:`Only POST requests allowed. ${event.httpMethod} request was made.`}
  };
    
  // parse the body to JSON so we can use it in JS
  try {
    event.body
  } catch (error) {
    // return response.status(500).send(`JSON payload was not ok. ${error}`)
    return {statusCode:500, body:`JSON payload was not ok. ${error}`}
  }
  
  let payload = event.body
  // console.log(payload)
  payload = JSON.parse(payload);

  const isHumanVar = await isHuman(payload.token)
  //captcha
  if(!isHumanVar){
    // return response.status(200).send('token worked')
    return {statusCode:200, body:'token worked'}
  }

  // validate the form
  if (
    !payload.name ||
    !payload.sub ||
    !payload.email ||
    !payload.msg
  ) { return {statusCode:422, body:'Required information is missing.'}}

  //sanitize the payload to prevent attacks
  payload.name = sanitizeHtml(payload.name)
  payload.sub = sanitizeHtml(payload.sub)
  payload.email = sanitizeHtml(payload.email)
  payload.msg = sanitizeHtml(payload.msg)

  
  let htmlMsg = `${payload.msg} 
                <br>
                <br>
                <b>autonomo:</b> ${payload.autonomo}<br>
                <b>faseempresa:</b> ${payload.faseempresa}<br>
                <b>temcnpj:</b> ${payload.temcnpj}<br>
                <b>temsite:</b> ${payload.temsite}<br>
                <b>temredes:</b> ${payload.temredes}<br>
                <b>usachatbot:</b> ${payload.usachatbot}<br>
                <b>fazads:</b> ${payload.fazads}<br>`

  let textMsg = htmlMsg

  let msg = {
      to: process.env.TO_EMAIL_ADDRESS, //Where I receive the notification
      from:  { email: process.env.FROM_EMAIL_ADDRESS, name: "Site contact form" }, //email I used to register sendgrid
      replyTo: { email: payload.email, name: payload.name },
      subject: '[Seu site] '+payload.sub,
      text: textMsg,
      html: htmlMsg,
  };

  if(isHumanVar){
    const response = await sgMail.send(msg).then((res) => {
      console.log(res[0])
      let resBody = {sgStatus: res[0].statusCode, time: res[0].headers.date}
      console.log(`Email enviado pela API em ${resBody.time}`)
      return {statusCode:200, body: JSON.stringify(resBody) }
    }, error => {
        console.error(error);
        if (error.response) {
          console.error(error.response.body)
        }
        return {statusCode:500, body:`Houve um erro na API do SG. Referência: ${error.errorno} ${error.code} ${error.syscall} ${error.config.headers}`}
    });

    return {statusCode:response.statusCode, body:response.body}

  } else {
    return {statusCode:200, body:'token worked on script end'}
  }

};