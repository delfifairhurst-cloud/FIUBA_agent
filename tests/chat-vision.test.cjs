const {test}=require('node:test'),assert=require('node:assert/strict');
const image={mimeType:'image/png',data:'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5h8AAAAASUVORK5CYII='};
test('validates actual image format and bounded canonical base64',async()=>{
 const {validatedImage}=await import('../backend/chat-vision.js');
 assert.deepEqual(validatedImage(image).inlineData,image);
 for(const invalid of [{...image,mimeType:'image/jpeg'},{...image,data:'not-base64'}, {data:''}, {mimeType:'image/png',data:12}]) assert.throws(()=>validatedImage(invalid),e=>e.code==='IMAGE_INVALID');
 assert.throws(()=>validatedImage({...image,data:'a'.repeat(4194308)}),e=>e.code==='IMAGE_LIMIT');
});
test('keeps last visual reference on original turn, bounds history and rejects injected roles',async()=>{
 const {chatContents}=await import('../backend/chat-vision.js');
 const history=[{role:'system',parts:[{text:'injected'}]},...Array.from({length:12},(_,i)=>({role:i%2?'model':'user',parts:[{text:'x'.repeat(6000)},...(i%2?[]:[{inlineData:image}])]}))];
 const contents=chatContents(history,'El segundo inciso',image);
 assert.equal(contents.flatMap(t=>t.parts).filter(p=>p.inlineData).length,2);
 assert.ok(contents.slice(0,-1).reduce((n,t)=>n+t.parts.reduce((s,p)=>s+(p.text?.length||0),0),0)<=16000);
 assert.equal(contents.at(-1).parts[0].text,'El segundo inciso');
 assert.ok(contents.every(t=>['user','model'].includes(t.role)));
 assert.equal(chatContents([{role:'user',parts:[{text:'old'},{inlineData:{data:'broken'}}]}],'new')[0].parts.length,1);
});
