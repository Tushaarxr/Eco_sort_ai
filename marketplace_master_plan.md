# EcoSort AI - Marketplace Master Plan

> **Version**: 2.0  
> **Target Market**: India  
> **Last Updated**: January 2026

---

## Executive Summary

Build a **comprehensive e-waste platform** with THREE disposal options:

| Option | Description | For Users Who Want |
|--------|-------------|-------------------|
| 🛒 **Sell to Vendors** | Marketplace connecting users with verified junk buyers | Cash for their e-waste |
| 🔄 **Exchange Programs** | Aggregated trade-in offers from brands & retailers | Discounts on new products |
| ♻️ **Responsible Disposal** | Certified recycling centers (existing feature) | Safe disposal of hazardous items |

**Key Differentiators**:
- AI-mediated vendor interactions to prevent scams
- Aggregated exchange offers from multiple sources
- One-stop solution for all e-waste disposal needs

---

## Three Disposal Paths

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER SCANS E-WASTE                          │
├─────────────────────────────────────────────────────────────────────┤
│                     "What do you want to do?"                       │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│    💰 SELL          │   🔄 EXCHANGE       │    ♻️ RECYCLE           │
│                     │                     │                         │
│  "Get cash from     │  "Trade-in for      │  "Dispose safely        │
│   local vendors"    │   new products"     │   at certified center"  │
│                     │                     │                         │
│  → Marketplace      │  → Exchange Hub     │  → Recycling Centers    │
│    Listing Flow     │    with Offers      │    (existing)           │
└─────────────────────┴─────────────────────┴─────────────────────────┘
```

---

## NEW FEATURE: Exchange Programs Hub

### What Is It?
A curated hub displaying **trade-in and exchange offers** from various brands and retailers where users can exchange their e-waste for:
- Discounts on new products
- Store credit
- Cashback
- Gift cards

### Why Add This?
1. Many users prefer upgrading over selling
2. Brands actively run exchange programs (Apple, Samsung, Amazon, Flipkart)
3. Better value for newer/working devices
4. Eco-friendly (devices get refurbished, not junked)

### Exchange Offer Sources

| Category | Sources | Offer Type |
|----------|---------|------------|
| **Smartphones** | Apple Trade In, Samsung Upgrade, OnePlus Exchange | Discount on new phone |
| **Laptops** | Dell Trade-in, HP Renew, Lenovo Exchange | Credit toward new laptop |
| **E-Commerce** | Amazon Exchange, Flipkart Exchange | Instant discount |
| **Electronics** | Croma Exchange, Vijay Sales | Store credit |
| **Banks/Cards** | HDFC SmartBuy, ICICI Offers | Cashback/EMI offers |

### How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER SCANS ITEM                                              │
│    AI identifies: "Samsung Galaxy S21, Good Condition"         │
├─────────────────────────────────────────────────────────────────┤
│ 2. EXCHANGE HUB                                                 │
│    Shows relevant offers:                                       │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ 🍎 Apple Trade In          Up to ₹25,000 credit         │  │
│    │ 📦 Amazon Exchange         ₹18,000 instant discount     │  │
│    │ 🛒 Flipkart Exchange       ₹20,000 + 10% extra          │  │
│    │ 📱 Samsung Upgrade         ₹22,000 + free accessories   │  │
│    └─────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│ 3. USER SELECTS OFFER                                           │
│    Redirects to partner website/app                             │
│    (We track referral for analytics)                            │
└─────────────────────────────────────────────────────────────────┘
```

### Exchange Hub Data Sources

**Phase 1 (MVP): Manual Curation**
- Admin-managed database of exchange offers
- Links to offer pages
- Updated weekly/monthly

**Phase 2 (Future): Web Scraping/APIs**
- Automated offer fetching
- Real-time prices
- API integrations where available

### Database: `exchange_offers` Table
```sql
CREATE TABLE exchange_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Partner Info
  partner_name TEXT NOT NULL,        -- "Apple", "Amazon", "Flipkart"
  partner_logo TEXT,                 -- Logo URL
  partner_type TEXT NOT NULL,        -- brand/ecommerce/retail
  
  -- Offer Details
  title TEXT NOT NULL,               -- "iPhone Trade In"
  description TEXT,
  offer_type TEXT NOT NULL,          -- discount/credit/cashback/gift_card
  
  -- Value
  min_value DECIMAL(10,2),           -- Minimum exchange value
  max_value DECIMAL(10,2),           -- Maximum exchange value
  value_text TEXT,                   -- "Up to ₹25,000"
  extra_benefits TEXT,               -- "10% extra on app"
  
  -- Applicability
  categories JSONB DEFAULT '[]',     -- ["smartphones", "laptops"]
  brands_accepted JSONB DEFAULT '[]', -- ["samsung", "apple", "oneplus"]
  conditions_accepted JSONB DEFAULT '[]', -- ["working", "minor_damage"]
  
  -- Link
  offer_url TEXT NOT NULL,           -- Deep link to offer page
  terms_url TEXT,                    -- T&C page
  
  -- Validity
  valid_from DATE,
  valid_until DATE,
  is_active BOOLEAN DEFAULT true,
  
  -- Tracking
  view_count INT DEFAULT 0,
  click_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Exchange Hub UI

**Main Screen**: Browseable list of offers
- Filter by: Category, Brand, Offer Type
- Sort by: Best Value, Newest, Popularity
- Search offers

**Offer Card Display**:
```
┌─────────────────────────────────────────────┐
│ [Logo]  Partner Name              [Badge]   │
│                                             │
│ Offer Title                                 │
│ "Exchange your old phone"                   │
│                                             │
│ 💰 Up to ₹25,000 credit                     │
│ 🎁 +10% extra via app                       │
│                                             │
│ ✓ Smartphones  ✓ Working/Minor damage       │
│                                             │
│ [View Offer →]                              │
└─────────────────────────────────────────────┘
```

**After Scan Integration**:
When user scans an item, show matching exchange offers alongside sell option:
```
Your Samsung Galaxy S21 (Good Condition)

┌─────────────────────────────────────────────┐
│ 💰 Sell to Vendors                          │
│    Estimated: ₹12,000 - ₹15,000             │
│    [List for Sale]                          │
├─────────────────────────────────────────────┤
│ 🔄 Exchange Offers (3 available)            │
│    Best: Amazon - ₹18,000 instant           │
│    [View All Offers]                        │
├─────────────────────────────────────────────┤
│ ♻️ Recycle Responsibly                      │
│    Find certified centers nearby            │
│    [Find Centers]                           │
└─────────────────────────────────────────────┘
```

---

## Updated App Architecture

### Triple Flow Design

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          EcoSort AI App                                 │
├─────────────────────┬─────────────────────┬─────────────────────────────┤
│     USER FLOW       │   EXCHANGE HUB      │      VENDOR FLOW            │
├─────────────────────┼─────────────────────┼─────────────────────────────┤
│ • Scan e-waste      │ • Browse offers     │ • Register as vendor        │
│ • Browse repository │ • Filter by type    │ • Upload documents          │
│ • List items (sell) │ • View offer detail │ • Await verification        │
│ • View vendor       │ • Redirect to       │ • Browse user listings      │
│   interests         │   partner site      │ • Express interest          │
│ • Track sales       │ • Track favorites   │ • Complete pickups          │
└─────────────────────┴─────────────────────┴─────────────────────────────┘
```

### Updated Navigation

```
Bottom Tabs:
[Scan] [Exchange] [Marketplace] [Recycling] [Profile]
         ↑ NEW!
```

---

## Updated Phased Development

### Phase 1: Foundation (Sprint 1-2)
**Goal**: Database + Basic UI structure

- [ ] Create Supabase tables (listings, vendors, transactions)
- [ ] Create `exchange_offers` table
- [ ] Set up RLS policies
- [ ] Add "Marketplace" tab to navigation
- [ ] Add "Exchange" tab to navigation
- [ ] Create empty state screens

### Phase 2: Exchange Hub MVP (Sprint 3-4)
**Goal**: Users can browse exchange offers

- [ ] Exchange Hub home screen
- [ ] Offer card component
- [ ] Offer detail screen
- [ ] Filter/search functionality
- [ ] Manual offer data entry (admin)
- [ ] Click tracking (analytics)

### Phase 3: User Listings (Sprint 5-6)
**Goal**: Users can list items for sale

- [ ] Create listing form
- [ ] Image upload (multi-image)
- [ ] Location picker
- [ ] AI price estimation integration
- [ ] My Listings screen
- [ ] Post-scan integration (sell/exchange options)

### Phase 4: Vendor Registration (Sprint 7-8)
**Goal**: Vendors can sign up and await verification

- [ ] Vendor auth flow
- [ ] Vendor registration form
- [ ] Document upload system
- [ ] Pending verification screen
- [ ] Basic admin panel

### Phase 5: Vendor Dashboard (Sprint 9-10)
**Goal**: Approved vendors can browse and show interest

- [ ] Vendor dashboard home
- [ ] Browse listings
- [ ] Show interest functionality
- [ ] My Interests screen

### Phase 6: Interest & Matching (Sprint 11-12)
**Goal**: AI-mediated interest flow

- [ ] Interest submission
- [ ] AI validation logic
- [ ] Accept/reject flow
- [ ] Contact reveal

### Phase 7: Transactions (Sprint 13-14)
**Goal**: Complete transaction flow

- [ ] Transaction creation
- [ ] Pickup scheduling
- [ ] Ratings & reviews

### Phase 8: Polish & Payment (Sprint 15-16)
**Goal**: Payment placeholder + UX polish

- [ ] Payment page (UI only)
- [ ] Notifications
- [ ] Analytics dashboard
- [ ] Bug fixes

---

## Updated Screen Inventory

### User App Screens
```
app/(main)/
├── scan/                   # Existing scan feature
├── repository/             # Existing e-waste guides
├── recycling-centers/      # Existing centers
├── profile/                # User profile
│
├── exchange/               # NEW - Exchange Hub
│   ├── index.tsx           # Browse all offers
│   ├── [offerId].tsx       # Offer detail + redirect
│   └── favorites.tsx       # Saved offers
│
└── marketplace/            # Sell to Vendors
    ├── index.tsx           # Browse listings / Home
    ├── create-listing.tsx  # Create/edit listing
    ├── [listingId].tsx     # Listing detail
    ├── my-listings.tsx     # User's listings
    ├── interests.tsx       # Incoming interests
    └── transactions.tsx    # Transaction history
```

### Vendor App Screens
```
app/(vendor)/
├── register.tsx         # Vendor registration
├── pending.tsx          # Awaiting verification
├── dashboard.tsx        # Vendor home
├── browse.tsx           # Browse listings
├── my-interests.tsx     # Interests shown
└── transactions.tsx     # Vendor transactions
```

---

## Updated API/Service Functions

### `src/api/exchangeService.ts` (NEW)
```typescript
// Exchange Offers
getExchangeOffers(filters?) → offers[]
getOfferById(id) → offer
getOffersForCategory(category) → offers[]
getOffersForItem(itemType, brand, condition) → offers[]
trackOfferClick(offerId) → void
saveOfferToFavorites(userId, offerId) → void
getUserFavorites(userId) → offers[]
```

### `src/api/marketplaceService.ts`
```typescript
// Listings
createListing(data) → listing
getListings(filters) → listings[]
getListingById(id) → listing
updateListing(id, data) → listing
deleteListing(id) → void
getUserListings(userId) → listings[]

// Vendors
registerVendor(data) → vendor
getVendorProfile(vendorId) → vendor
updateVendorProfile(vendorId, data) → vendor
getVendorStatus(userId) → status
uploadVendorDocument(vendorId, file) → url

// Interests
showInterest(vendorId, listingId, data) → interest
getListingInterests(listingId) → interests[]
getVendorInterests(vendorId) → interests[]
respondToInterest(interestId, action) → interest

// Transactions
createTransaction(interestId) → transaction
updateTransaction(transactionId, data) → transaction
completeTransaction(transactionId) → transaction
rateTransaction(transactionId, rating, review) → void
```

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| App Architecture | Triple flow (User/Exchange/Vendor) | Complete e-waste solution |
| Exchange Data | Manual curation (MVP) | Reliable, controlled quality |
| Exchange Model | Affiliate links/redirects | No payment handling needed |
| Vendor Communication | AI-mediated | Safety, spam prevention |
| Payment | Offline (MVP) | Reduces complexity |
| Verification | Document upload + Admin | Trust without complexity |
| Target | India only | Focus, INR, local partners |

---

## Revenue Potential (Future)

| Stream | Model |
|--------|-------|
| Exchange Referrals | Affiliate commission from partners |
| Vendor Subscriptions | Premium vendor features |
| Featured Listings | Sellers pay to boost visibility |
| Transaction Fee | Small % on completed sales |

---

## Next Steps

1. ✅ Review updated plan with Exchange feature
2. **Commit cleanup changes** to git
3. **Create new branch** for marketplace
4. **Start Phase 1**: Database tables
5. **Build Exchange Hub** (simpler, good first milestone)

---

## Reference Links

- [Supabase Dashboard](https://supabase.com/dashboard)
- [Clerk Dashboard](https://dashboard.clerk.com)
- [Apple Trade In](https://www.apple.com/in/trade-in/)
- [Amazon Exchange](https://www.amazon.in/b?node=15547979031)
- [Flipkart Exchange](https://www.flipkart.com/exchange)
