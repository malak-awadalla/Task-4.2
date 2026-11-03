import React, { useEffect, useMemo, useState } from 'react';

const KEY = 'acl-marketplace-v3';
const categories = ['all', 'textbooks', 'electronics', 'furniture', 'clothing', 'other'];
const conditions = ['new', 'like-new', 'used', 'worn'];
const currentUser = {name: 'You', email: 'you@example.com'}; // Demo account; no login backend
const photo = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=82`;
const seed = [
  {id:'m1', title:'Calculus II textbook', category:'textbooks', condition:'used', price:320, description:'Second-year calculus textbook, complete with all chapters. A few highlighted sections and notes in pencil, but no missing or torn pages. Useful for the midterm and final revision sessions. You can inspect it before deciding.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC student area, near the main cafeteria', photos:[photo('photo-1544947950-fa07a98d237f'),photo('photo-1494438639946-1ebd1d20bf85')], emoji:'📚'},
  {id:'m2', title:'Student desk lamp', category:'furniture', condition:'like-new', price:240, description:'Compact study lamp with warm light, adjustable position and a USB power cable. Used for one semester only. The cable and light both work. Great for a dorm desk or a small workspace.', status:'active', owner:'other', seller:'Mariam', sellerEmail:'mariam.seller@example.com', pickup:'GUC library entrance, weekdays after 1 PM', photos:[photo('photo-1555475384-a0aefc775412')], emoji:'💡'},
  {id:'m3', title:'Bluetooth headphones', category:'electronics', condition:'used', price:650, description:'Wireless over-ear headphones in good working condition. They connect with Bluetooth and include the original carrying pouch and charging cable. The battery lasts about six hours based on my usage. There are a few cosmetic scratches near one hinge; see the photos. Happy to let you test sound and pairing before buying.', status:'active', owner:'other', seller:'Omar', sellerEmail:'omar.seller@example.com', pickup:'Arrange a meetup at GUC Gate 3', photos:[photo('photo-1599955051125-571f47e04316'),photo('photo-1505740420928-5e560c06d30e'),photo('photo-1546435770-a3e426bf472b')], emoji:'🎧'},
  {id:'m4', title:'Engineering lab coat', category:'clothing', condition:'new', price:200, description:'White engineering lab coat, medium size, bought for a lab but never worn. Still clean and folded. Suitable for laboratory practical sessions. Please check your required size before arranging pickup.', status:'active', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'Meet at GUC main entrance, mornings', photos:[photo('photo-1542058186993-286fdce0b580')], emoji:'🥼'},
  {id:'m5', title:'Drawing tablet', category:'electronics', condition:'like-new', price:1450, description:'Small USB drawing tablet with pressure-sensitive pen and protective sleeve. Used for a few class illustrations; fully functional. Works with common creative software after installing the manufacturer driver. You are welcome to try the pen and pressure sensitivity on my laptop before buying.', status:'active', owner:'other', seller:'Nour', sellerEmail:'nour.seller@example.com', pickup:'GUC design building reception', photos:[photo('photo-1671087709820-274fdd9ac67a')], emoji:'✏️'},
  {id:'m6', title:'Used storage shelf', category:'furniture', condition:'worn', price:390, description:'Light wooden storage shelf. Stable and usable, though there are visible scratches from moving rooms. The shelves are best for books, stationery and small storage boxes, not very heavy appliances. Buyer should arrange a way to transport it from near campus.', status:'active', owner:'other', seller:'Youssef', sellerEmail:'youssef.seller@example.com', pickup:'Collect from a public pickup point near GUC, by arrangement', photos:[photo('photo-1692195321701-1a454c79ab02'),photo('photo-1758279746549-d24f3784879d')], emoji:'🗄️'},
  {id:'m7', title:'MATH 201 workbook', category:'textbooks', condition:'used', price:140, description:'Workbook with practice problems, solutions and lecture notes. All pages present and in readable condition. Some exercises have answers written in pencil. Already sold to another student.', status:'sold', owner:'you', seller:'You', sellerEmail:currentUser.email, pickup:'GUC campus (previous listing)', photos:[photo('photo-1544947950-fa07a98d237f')], emoji:'📖'},
  {id:'m8', title:'Sketching kit', category:'other', condition:'like-new', price:180, description:'Charcoal pencils, graphite pencils, blending tools and an A5 sketch pad. Some pencils have been lightly used, but the set still has plenty of material for design practice and drawing assignments.', status:'active', owner:'other', seller:'Salma', sellerEmail:'salma.seller@example.com', pickup:'Meet outside the GUC architecture studios', photos:[photo('photo-1758521232691-613561977b6a'),photo('photo-1771366629879-8b3128ee62ca')], emoji:'🎨'},
];
const emptyForm = {title:'', price:'', category:'', condition:'', description:'', pickup:'', status:'active'};
function saved(){try {const value=JSON.parse(localStorage.getItem(KEY));return Array.isArray(value)?value:seed;}catch{return seed;}}
const cap = s => s==='like-new'?'Like new':(s||'').replace(/\b\w/g,m=>m.toUpperCase());
function findError(form){
 if(!form.title.trim())return 'Please complete the item title.';
 if(form.price.trim()==='' || !Number.isFinite(Number(form.price)) || Number(form.price)<0)return 'Enter a price of zero or more.';
 if(!categories.slice(1).includes(form.category))return 'Choose a category.';
 if(!conditions.includes(form.condition))return 'Choose an item condition.';
 if(!['active','sold'].includes(form.status))return 'Choose a valid status.';
 return '';
}
function ListingImage({src, alt, emoji, className=''}) {
 const [broken, setBroken] = useState(false);
 useEffect(() => setBroken(false), [src]);
 return src && !broken
   ? <img className={className} src={src} alt={alt} loading="lazy" onError={() => setBroken(true)} />
   : <span className="item-emoji" aria-label="Photo unavailable">{emoji || '📦'}</span>;
}
export default function App(){
 const [items,setItems] = useState(saved);
 const [query,setQuery] = useState('');
 const [category,setCategory] = useState('all');
 const [sort,setSort] = useState('featured');
 const [showMyListingsOnly, setShowMyListingsOnly] = useState(false);
 const [selected,setSelected] = useState(null);
 const [editor,setEditor] = useState(null); // null or {id,form}
 const [error,setError] = useState('');
 const [activePhoto,setActivePhoto] = useState(0);
 const [notice,setNotice] = useState('');
 useEffect(()=>localStorage.setItem(KEY,JSON.stringify(items)),[items]);
 useEffect(()=>setActivePhoto(0),[selected]);
 const listing = useMemo(()=>{
   let a=items.filter(x => 
     (showMyListingsOnly ? x.owner === 'you' : true) &&
     (category==='all'||x.category===category) &&
     `${x.title} ${x.category} ${x.description}`.toLowerCase().includes(query.toLowerCase())
   );
   if(sort==='low')a.sort((a,b)=>a.price-b.price);
   if(sort==='high')a.sort((a,b)=>b.price-a.price);
   return a;
 },[items,category,query,sort,showMyListingsOnly]);

 function startEdit(item){if(item&&item.owner!=='you')return;setError('');setSelected(null);setEditor({id:item?.id||null,form:item?{title:item.title,price:String(item.price),category:item.category,condition:item.condition,description:item.description,pickup:item.pickup || '',status:item.status}:{...emptyForm}});}
 function submit(event){event.preventDefault();const f=editor.form;const err=findError(f);if(err){setError('Unable to save item. Check the form.');return;}const original=editor.id?items.find(x=>x.id===editor.id):null;const next={...f, title:f.title.trim(),price:Number(f.price),description:f.description.trim(),pickup:f.pickup.trim(),photos:original?.photos || [],emoji:original?.emoji || '📦',owner:'you',seller:currentUser.name,sellerEmail:currentUser.email};
 if(editor.id){setItems(items.map(x=>x.id===editor.id?{...x,...next}:x));setNotice('Changes saved.');}else{setItems([{...next,id:`m-${Date.now()}`,status:'active'},...items]);setNotice('Item listed.');}setEditor(null);setSelected(null);}
 function reset(){setItems(seed);setSelected(null);setEditor(null);setQuery('');setCategory('all');setSort('featured');setShowMyListingsOnly(false);setNotice('Example items restored.');}
 return <div className="market-app">
  <div className="utility"><span>Campus Exchange</span><span>Trusted by students • All prices in EGP</span></div>
  
  <header className="navigation">
    <button className="brand" onClick={()=>{setSelected(null);setCategory('all');setEditor(null);setShowMyListingsOnly(false);}}>
      <span className="brand-icon">✳</span> CAMPUS<span className="brand-alt">exchange</span>
    </button>
    
    <div className="header-search-container" style={{ flex: 1, margin: '0 1.5rem' }}>
      <label className="search" style={{ width: '100%', display: 'flex' }}>
        <span>⌕</span>
        <input aria-label="Search listings" placeholder="Search items across campus..." value={query} onChange={e=>setQuery(e.target.value)} style={{ width: '100%' }}/>
      </label>
    </div>

    <div className="nav-actions" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
      <button 
        className={`my-listings-btn ${showMyListingsOnly ? 'active' : ''}`} 
        onClick={() => { setEditor(null); setShowMyListingsOnly(!showMyListingsOnly); }}
        style={{
          padding: '0.5rem 0.85rem',
          borderRadius: '4px',
          border: '1px solid #ccc',
          background: showMyListingsOnly ? '#111' : '#fff',
          color: showMyListingsOnly ? '#fff' : '#111',
          cursor: 'pointer',
          fontSize: '0.875rem'
        }}
      >
        {showMyListingsOnly ? '✓ My Listings' : 'My Listings'}
      </button>
      <span className="usercircle">Y</span>
      <button className="sell-cta" onClick={()=>startEdit(null)}>+ Sell an item</button>
    </div>
  </header>

  <main>
   {editor ? (
     <div className="sell-full-page" style={{ maxWidth: '800px', margin: '3rem auto', padding: '0 1.5rem 4rem 1.5rem', width: '100%' }}>
       <div className="modal-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1.5rem' }}>
         <div>
           <p className="section-kicker">CAMPUS EXCHANGE</p>
           <h2>{editor.id ? 'Edit your listing' : 'Sell an item'}</h2>
           <p>Add the details below and publish it to the campus marketplace.</p>
         </div>
         <button className="close" onClick={()=>setEditor(null)} style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
       </div>
       <form onSubmit={submit}>
         <div className="field-grid">
           <label><span>Item title *</span><input value={editor.form.title} onChange={e=>setEditor(s=>({...s,form:{...s.form,title:e.target.value}}))} placeholder="What are you selling?"/></label>
           <label><span>Price (EGP) *</span><input type="number" min="0" step="0.01" value={editor.form.price} onChange={e=>setEditor(s=>({...s,form:{...s.form,price:e.target.value}}))} placeholder="Price"/></label>
           <label><span>Category *</span><select value={editor.form.category} onChange={e=>setEditor(s=>({...s,form:{...s.form,category:e.target.value}}))}><option value="">Select</option>{categories.slice(1).map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
           <label><span>Condition *</span><select value={editor.form.condition} onChange={e=>setEditor(s=>({...s,form:{...s.form,condition:e.target.value}}))}><option value="">Select</option>{conditions.map(c=><option value={c} key={c}>{cap(c)}</option>)}</select></label>
           <label className="wide"><span>Description</span><textarea value={editor.form.description} onChange={e=>setEditor(s=>({...s,form:{...s.form,description:e.target.value}}))} placeholder="Description" rows="5"/></label>
           <label className="wide"><span>Pickup / meetup location</span><input value={editor.form.pickup} onChange={e=>setEditor(s=>({...s,form:{...s.form,pickup:e.target.value}}))} placeholder="e.g. Library entrance or arrange on campus" /></label>
           <label className="wide"><span>Seller contact email</span><input value={currentUser.email} readOnly aria-readonly="true" className="readonly-input"/><small className="email-helper">Taken from your registered account, so buyers can contact you about this item.</small></label>
           {editor.id&&<label><span>Status</span><select value={editor.form.status} onChange={e=>setEditor(s=>({...s,form:{...s.form,status:e.target.value}}))}><option value="active">Active</option><option value="sold">Sold</option></select></label>}
         </div>
         {error&&<p className="alert" role="alert" style={{ marginTop: '1rem', color: '#d93838' }}>{error}</p>}
         <div className="modal-foot" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
           <button type="button" onClick={()=>setEditor(null)} style={{ padding: '0.75rem 1.5rem', background: '#f1f1f1', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
           <button className="sell-cta" type="submit" style={{ padding: '0.75rem 1.5rem' }}>{editor.id?'Save changes':'Publish item'}</button>
         </div>
       </form>
     </div>
   ) : (
     <>
       {/* Compact Banner Box preserving original text sizing */}
       <section className="promo" style={{ padding: '1.25rem 2rem', minHeight: 'auto', marginBottom: '1.25rem' }}>
         <div className="promo-copy">
           <span className="tag">THE CAMPUS MARKETPLACE</span>
           <h1 style={{ margin: '0.35rem 0' }}>Everything you need,<br/><i>right around campus.</i></h1>
           <p style={{ margin: 0 }}>Browse little finds, big essentials and almost everything in between.</p>
         </div>
         <div className="promo-art"><span>📚</span><span>💡</span><span>🎧</span><span>🛋️</span></div>
       </section>

       <section className="discovery" id="discover">
        <div className="discover-top">
          <div>
            <p className="section-kicker">CURATED FOR YOUR CAMPUS</p>
            <h2>{showMyListingsOnly ? 'My Listings' : 'Find something good.'}</h2>
            <p>{showMyListingsOnly ? 'Items you have posted for sale.' : 'Items listed by people around you.'}</p>
          </div>
          <div className="discover-right">
            <label className="sort">
              <span>Sort</span>
              <select value={sort} onChange={e=>setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
        
        <div className="category-row">{categories.map(c=><button key={c} onClick={()=>setCategory(c)} className={category===c?'on':''}>{c==='all'?'All items':cap(c)}</button>)}</div>
        {notice&&<p className="notice" role="status">{notice} <button onClick={()=>setNotice('')}>×</button></p>}
        
        <div className="listing-grid">
          {listing.map(item => (
            <article className="product" key={item.id}>
              <button className="photo" onClick={()=>setSelected(item.id)} style={{ position: 'relative', overflow: 'hidden' }}>
                <span className="stamp">{cap(item.condition)}</span>
                <ListingImage src={item.photos?.[0]} alt={item.title} emoji={item.emoji} className="listing-img" />
                <span className="category-caption">{cap(item.category)}</span>
                
                {/* Overlay shade for sold items */}
                {item.status === 'sold' && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '1.25rem',
                    letterSpacing: '0.1em',
                    zIndex: 2
                  }}>
                    SOLD
                  </div>
                )}
              </button>
              <div className="prod-details">
                <div className="prod-topline">
                  <span className="muted">{item.category}</span>
                  <span className={item.status==='sold'?'soldstatus':'instock'}>{item.status.toUpperCase()}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="costline">
                  <strong>EGP {item.price.toLocaleString()}</strong>
                  <span>{item.condition}</span>
                </div>
                <button className="details-button" onClick={()=>setSelected(item.id)}>View item <span>↗</span></button>
              </div>
            </article>
          ))}
          {listing.length===0&&<p className="noresults">No listings match your selection.</p>}
        </div>
       </section>
       <footer><strong>CAMPUS exchange</strong><span>From students, for students.</span><button onClick={reset}>Reset demo</button></footer>
     </>
   )}
  </main>
  
  {selected&&(()=>{
   const item=items.find(x=>x.id===selected);if(!item)return null;
   const images=item.photos || [];
   const subject=encodeURIComponent(`Campus Exchange: ${item.title}`);
   const body=encodeURIComponent(`Hi ${item.seller},\n\nI'm interested in your listing "${item.title}" (EGP ${item.price}). Is it still available?\n\n`);
   return <div className="overlay" onMouseDown={e=>e.target===e.currentTarget&&setSelected(null)}>
    <section className="detail-panel" role="dialog" aria-modal="true" aria-label="Item details">
     <button className="close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button>
     <div className="detail-visual">
      <ListingImage src={images[activePhoto] || images[0]} alt={`${item.title} photo ${activePhoto+1}`} emoji={item.emoji} className="detail-img" />
     </div>
     {images.length>1&&<div className="detail-thumbs" aria-label="Item photos">{images.map((src,index)=><button type="button" key={index} className={activePhoto===index?'thumb active':'thumb'} aria-label={`Show photo ${index+1} of ${images.length}`} aria-pressed={activePhoto===index} onClick={()=>setActivePhoto(index)}><ListingImage src={src} alt="" emoji={item.emoji} className="thumb-img" /></button>)}</div>}
     <p className="section-kicker">{cap(item.category)} · {cap(item.condition)}</p>
     <h2>{item.title}</h2>
     <h3>EGP {item.price.toLocaleString()}</h3>
     <p className="item-description">{item.description||'No description supplied.'}</p>
     <div className="detail-meta"><p><strong>Pickup</strong><br/>{item.pickup || 'Arrange directly with seller'}</p><p><strong>Seller</strong><br/>{item.seller}</p></div>
     <p className="muted">Status: {item.status}</p>
     {item.owner==='you'
        ? <button className="sell-cta" onClick={()=>startEdit(item)}>Edit your listing</button>
        : item.status==='sold'
          ? <p className="fineprint">This item is marked as sold.</p>
          : <a className="sell-cta contact-seller" href={`mailto:${item.sellerEmail}?subject=${subject}&body=${body}`}>✉ Contact seller</a>}
    </section>
   </div>;
  })()}
 </div>;
}