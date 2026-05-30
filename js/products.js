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
    
    return onSnapshot(productsRef, (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Sort products by timestamp locally to ensure products without timestamps still appear
        products.sort((a, b) => {
            const getVal = (v) => {
                if (!v) return 0;
                if (typeof v === 'number') return v;
                if (v.seconds) return v.seconds * 1000 + (v.nanoseconds / 1000000);
                return 0;
            };
            return getVal(b.timestamp) - getVal(a.timestamp);
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
