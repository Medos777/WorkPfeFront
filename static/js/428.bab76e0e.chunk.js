"use strict";(self.webpackChunkpfefront=self.webpackChunkpfefront||[]).push([[428],{60428:(t,e,n)=>{n.r(e),n.d(e,{default:()=>Q});var r=n(65043),a=n(61596),s=n(7353),o=n(94496),i=n(35721),c=n(71322),l=n(89379),u=n(80045),d=n(58387),f=n(98610),m=n(51347),h=n(34535),v=n(98206),x=n(92532),p=n(72372);function g(t){return(0,p.Ay)("MuiListItemAvatar",t)}(0,x.A)("MuiListItemAvatar",["root","alignItemsFlexStart"]);var A=n(70579);const j=["className"],M=(0,h.Ay)("div",{name:"MuiListItemAvatar",slot:"Root",overridesResolver:(t,e)=>{const{ownerState:n}=t;return[e.root,"flex-start"===n.alignItems&&e.alignItemsFlexStart]}})({minWidth:56,flexShrink:0,variants:[{props:{alignItems:"flex-start"},style:{marginTop:8}}]}),D=r.forwardRef((function(t,e){const n=(0,v.b)({props:t,name:"MuiListItemAvatar"}),{className:a}=n,s=(0,u.A)(n,j),o=r.useContext(m.A),i=(0,l.A)((0,l.A)({},n),{},{alignItems:o.alignItems}),c=(t=>{const{alignItems:e,classes:n}=t,r={root:["root","flex-start"===e&&"alignItemsFlexStart"]};return(0,f.A)(r,g,n)})(i);return(0,A.jsx)(M,(0,l.A)({className:(0,d.A)(c.root,a),ownerState:i,ref:e},s))}));var y=n(81045),S=n(48734),w=n(39336),I=n(17392),b=n(67784),F=n(42518);const X=(0,n(66734).A)((0,A.jsx)("path",{d:"M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z"}),"AttachFile");var N=n(95874),T=n(12440);function C(t){return(0,T.w)(t,Date.now())}var k=n(91669),Y=n(50849),E=n(19219),H=n(51844),R=n(62316);function V(t,e){const n=+(0,R.a)(t)-+(0,R.a)(e);return n<0?-1:n>0?1:n}var z=n(84524);function L(t,e,n){const[r,a]=(0,H.x)(null===n||void 0===n?void 0:n.in,t,e);return 12*(r.getFullYear()-a.getFullYear())+(r.getMonth()-a.getMonth())}function O(t,e){const n=(0,R.a)(t,null===e||void 0===e?void 0:e.in);return n.setHours(23,59,59,999),n}function G(t,e){const n=(0,R.a)(t,null===e||void 0===e?void 0:e.in),r=n.getMonth();return n.setFullYear(n.getFullYear(),r+1,0),n.setHours(23,59,59,999),n}function q(t,e){const n=(0,R.a)(t,null===e||void 0===e?void 0:e.in);return+O(n,e)===+G(n,e)}function P(t,e,n){const[r,a,s]=(0,H.x)(null===n||void 0===n?void 0:n.in,t,t,e),o=V(a,s),i=Math.abs(L(a,s));if(i<1)return 0;1===a.getMonth()&&a.getDate()>27&&a.setDate(30),a.setMonth(a.getMonth()-o*i);let c=V(a,s)===-o;q(r)&&1===i&&1===V(r,s)&&(c=!1);const l=o*(i-+c);return 0===l?0:l}function W(t,e){return+(0,R.a)(t)-+(0,R.a)(e)}function J(t,e,n){const r=W(t,e)/1e3;return(a=null===n||void 0===n?void 0:n.roundingMethod,t=>{const e=(a?Math[a]:Math.trunc)(t);return 0===e?0:e})(r);var a}function U(t,e,n){var r,a;const s=(0,Y.q)(),o=null!==(r=null!==(a=null===n||void 0===n?void 0:n.locale)&&void 0!==a?a:s.locale)&&void 0!==r?r:k.c,i=V(t,e);if(isNaN(i))throw new RangeError("Invalid time value");const c=Object.assign({},n,{addSuffix:null===n||void 0===n?void 0:n.addSuffix,comparison:i}),[l,u]=(0,H.x)(null===n||void 0===n?void 0:n.in,...i>0?[e,t]:[t,e]),d=J(u,l),f=((0,E.G)(u)-(0,E.G)(l))/1e3,m=Math.round((d-f)/60);let h;if(m<2)return null!==n&&void 0!==n&&n.includeSeconds?d<5?o.formatDistance("lessThanXSeconds",5,c):d<10?o.formatDistance("lessThanXSeconds",10,c):d<20?o.formatDistance("lessThanXSeconds",20,c):d<40?o.formatDistance("halfAMinute",0,c):d<60?o.formatDistance("lessThanXMinutes",1,c):o.formatDistance("xMinutes",1,c):0===m?o.formatDistance("lessThanXMinutes",1,c):o.formatDistance("xMinutes",m,c);if(m<45)return o.formatDistance("xMinutes",m,c);if(m<90)return o.formatDistance("aboutXHours",1,c);if(m<z.F6){const t=Math.round(m/60);return o.formatDistance("aboutXHours",t,c)}if(m<2520)return o.formatDistance("xDays",1,c);if(m<z.Nw){const t=Math.round(m/z.F6);return o.formatDistance("xDays",t,c)}if(m<2*z.Nw)return h=Math.round(m/z.Nw),o.formatDistance("aboutXMonths",h,c);if(h=P(u,l),h<12){const t=Math.round(m/z.Nw);return o.formatDistance("xMonths",t,c)}{const t=h%12,e=Math.trunc(h/12);return t<3?o.formatDistance("aboutXYears",e,c):t<9?o.formatDistance("overXYears",e,c):o.formatDistance("almostXYears",e+1,c)}}function B(t,e){return U(t,C(t),e)}var K=n(42104);const Q=t=>{let{projectId:e,currentUser:n}=t;const[l,u]=(0,r.useState)([]),[d,f]=(0,r.useState)(""),[m,h]=(0,r.useState)(null),v=(0,r.useRef)(null);(0,r.useEffect)((()=>{const t=(0,K.Ay)("http://localhost:3000",{query:{projectId:e}});return h(t),x(),t.on("new-message",(t=>{u((e=>[...e,t]))})),()=>t.disconnect()}),[e]);const x=async()=>{try{const t=await fetch("/api/projects/".concat(e,"/messages")),n=await t.json();u(n)}catch(t){console.error("Error fetching messages:",t)}};(0,r.useEffect)((()=>{(()=>{var t;null===(t=v.current)||void 0===t||t.scrollIntoView({behavior:"smooth"})})()}),[l]);return(0,A.jsxs)(a.A,{sx:{height:"600px",display:"flex",flexDirection:"column"},children:[(0,A.jsx)(s.A,{sx:{p:2,backgroundColor:"primary.main",color:"white"},children:(0,A.jsx)(o.A,{variant:"h6",children:"Project Chat"})}),(0,A.jsxs)(i.A,{sx:{flexGrow:1,overflow:"auto",p:2},children:[l.map(((t,e)=>(0,A.jsxs)(r.Fragment,{children:[(0,A.jsxs)(c.Ay,{alignItems:"flex-start",children:[(0,A.jsx)(D,{children:(0,A.jsx)(y.A,{alt:t.user.name,src:t.user.avatar})}),(0,A.jsx)(S.A,{primary:(0,A.jsx)(o.A,{component:"span",variant:"body1",color:"text.primary",children:t.user.name}),secondary:(0,A.jsxs)(A.Fragment,{children:[(0,A.jsx)(o.A,{component:"span",variant:"body2",color:"text.primary",children:t.content})," \u2014 ",B(new Date(t.timestamp),{addSuffix:!0})]})})]}),e<l.length-1&&(0,A.jsx)(w.A,{variant:"inset",component:"li"})]},t.id))),(0,A.jsx)("div",{ref:v})]}),(0,A.jsxs)(s.A,{component:"form",onSubmit:async t=>{if(t.preventDefault(),!d.trim())return;const r={content:d,projectId:e,userId:n.id,timestamp:(new Date).toISOString()};try{await fetch("/api/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(r)}),m.emit("send-message",r),f("")}catch(a){console.error("Error sending message:",a)}},sx:{p:2,backgroundColor:"background.paper",borderTop:1,borderColor:"divider",display:"flex",gap:1},children:[(0,A.jsx)(I.A,{size:"small",children:(0,A.jsx)(X,{})}),(0,A.jsx)(b.A,{fullWidth:!0,size:"small",value:d,onChange:t=>f(t.target.value),placeholder:"Type a message...",variant:"outlined"}),(0,A.jsx)(F.A,{variant:"contained",endIcon:(0,A.jsx)(N.A,{}),type:"submit",children:"Send"})]})]})}},95874:(t,e,n)=>{n.d(e,{A:()=>s});var r=n(66734),a=n(70579);const s=(0,r.A)((0,a.jsx)("path",{d:"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"}),"Send")}}]);
//# sourceMappingURL=428.bab76e0e.chunk.js.map