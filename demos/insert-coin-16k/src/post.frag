precision mediump float;
uniform sampler2D s;
uniform vec2 sh;
varying vec2 u;
void main(){
vec2 p=u*2.-1.;
p*=1.+dot(p,p)*.07;
vec2 q=p*.5+.5+sh/vec2(320.,180.);
if(q.x<0.||q.x>1.||q.y<0.||q.y>1.){gl_FragColor=vec4(0.,0.,0.,1.);return;}
vec2 d=vec2(1./320.,1./180.);
vec3 c=texture2D(s,q).rgb;
vec3 b=(texture2D(s,q+vec2(2.*d.x,0.)).rgb+texture2D(s,q-vec2(2.*d.x,0.)).rgb+texture2D(s,q+vec2(0.,2.*d.y)).rgb+texture2D(s,q-vec2(0.,2.*d.y)).rgb)*.25;
vec3 h=texture2D(s,q-vec2(d.x,0.)).rgb;
c+=max(b-.35,0.)*1.2+h*.12;
c*=.82+.18*sin(u.y*1131.);
c*=1.-dot(p,p)*.35;
gl_FragColor=vec4(c,1.);
}
