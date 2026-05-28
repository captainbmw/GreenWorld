import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Helper to escape HTML and prevent XSS
export function escapeHtml(value) {
    if (typeof value !== 'string') return value;
    const div = document.createElement('div');
    div.textContent = value;
    return div.innerHTML;
}

// Function to fetch and listen to real-time updates for products
export function listenToProducts(callback) {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("timestamp", "desc"));
    
    return onSnapshot(q, (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        callback(products);
    }, (error) => {
        console.error("Error listening to products:", error);
        callback([]);
    });
}

// Function to fetch and listen to real-time updates for packages (categories)
export function listenToPackages(callback) {
    const packagesRef = collection(db, "packages");
    
    return onSnapshot(packagesRef, (snapshot) => {
        const packages = [];
        snapshot.forEach((doc) => {
            packages.push({ id: doc.id, ...doc.data() });
        });
        
        // If no packages exist, provide defaults for better UX
        if (packages.length === 0) {
            packages.push(
                { id: "detox", name: "Detox" },
                { id: "immunity", name: "Immunity" },
                { id: "vitality", name: "Vitality" },
                { id: "skincare", name: "Skincare" }
            );
        }
        callback(packages);
    }, (error) => {
        console.error("Error listening to packages:", error);
        callback([]);
    });
}

// Helper to group products by their category
export function groupProducts(products, packages) {
    const groups = {};
    
    products.forEach(product => {
        const catId = product.category || 'uncategorized';
        if (!groups[catId]) {
            const pkg = packages.find(p => p.id === catId);
            groups[catId] = {
                id: catId,
                name: pkg ? pkg.name : catId.charAt(0).toUpperCase() + catId.slice(1),
                products: []
            };
        }
        groups[catId].products.push(product);
    });
    
    return Object.values(groups);
}

// Helper to get package name from ID
export function getPackageName(id, packages) {
    const pkg = packages.find(p => p.id === id);
    return pkg ? pkg.name : id;
}
