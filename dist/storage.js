let database;
export const openDatabase = () => database ||= new Promise((resolve,reject)=>{
 const request=indexedDB.open('folio-library',1);
 request.onupgradeneeded=()=>{const db=request.result;db.createObjectStore('books',{keyPath:'id'});db.createObjectStore('contents',{keyPath:'id'});db.createObjectStore('settings',{keyPath:'key'});};
 request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
});
export async function run(store,mode,operation){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(store,mode);const request=operation(tx.objectStore(store));let result;request.onsuccess=()=>result=request.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Không thể lưu dữ liệu.'));});}
export const getBooks=()=>run('books','readonly',s=>s.getAll());
export const getContent=id=>run('contents','readonly',s=>s.get(id));
export const saveBook=book=>run('books','readwrite',s=>s.put(book));
export const getSetting=async(key,fallback)=>{const r=await run('settings','readonly',s=>s.get(key));return r?r.value:fallback;};
export const setSetting=(key,value)=>run('settings','readwrite',s=>s.put({key,value}));
export async function addBook(book,content){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(['books','contents'],'readwrite');tx.objectStore('books').put(book);tx.objectStore('contents').put({id:book.id,...content});tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Không đủ dung lượng để lưu sách.'));});}
export async function deleteBook(id){const db=await openDatabase();return new Promise((resolve,reject)=>{const tx=db.transaction(['books','contents'],'readwrite');tx.objectStore('books').delete(id);tx.objectStore('contents').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
