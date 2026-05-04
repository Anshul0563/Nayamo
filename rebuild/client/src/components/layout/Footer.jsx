export default function Footer() {
  return (
    <footer className="bg-nayamo-bg-elevated border-t border-nayamo-border-light mt-20">
      <div className="nayamo-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-serif font-bold text-nayamo-text-primary mb-4">Nayamo</h3>
            <p className="text-nayamo-text-muted mb-4">
              Timeless elegance redefined. Premium artificial jewellery for every occasion.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-nayamo-gold/20 flex items-center justify-center">
                f
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-nayamo-gold/20 flex items-center justify-center">
                i
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-nayamo-gold/20 flex items-center justify-center">
                in
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-nayamo-text-primary mb-4">Quick Links</h4>
            <ul className="space-y-2 text-nayamo-text-muted">
              <li><a href="/shop">Shop</a></li>
              <li><a href="/about">About</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-nayamo-text-primary mb-4">Customer Care</h4>
            <ul className="space-y-2 text-nayamo-text-muted">
              <li><a href="/privacy-policy">Privacy Policy</a></li>
              <li><a href="/terms-of-service">Terms of Service</a></li>
              <li>Help Center</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-nayamo-text-primary mb-4">Newsletter</h4>
            <p className="text-nayamo-text-muted mb-4 text-sm">
              Get updates on new collections and offers
            </p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="your@email.com"
                className="nayamo-input flex-1 text-sm"
              />
              <button className="ml-2 bg-nayamo-gold text-black px-4 py-2 rounded-xl font-medium whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-nayamo-border-light mt-12 pt-8 text-center text-nayamo-text-muted text-sm">
          <p>&copy; 2026 Nayamo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

