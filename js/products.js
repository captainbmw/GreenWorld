import { db } from './firebase-config.js';
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Helper to escape HTML and prevent XSS
export function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

// Function to get package name by ID
export function getPackageName(id, packages) {
    const pkg = packages.find(p => p.id === id);
    return pkg ? pkg.name : (id || 'General');
}

// Function to group products by category/package
export function groupProducts(productList, packages) {
    const groups = new Map();
    productList.forEach(product => {
        const key = product.category || 'uncategorized';
        if (!groups.has(key)) {
            groups.set(key, {
                id: key,
                name: getPackageName(key, packages),
                products: []
            });
        }
        groups.get(key).products.push(product);
    });

    return [...groups.values()].sort((a, b) => {
        const aIndex = packages.findIndex(pkg => pkg.id === a.id);
        const bIndex = packages.findIndex(pkg => pkg.id === b.id);
        if (aIndex === -1 && bIndex === -1) return a.name.localeCompare(b.name);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
    });
}

// Real-time listener for products
export function listenToProducts(callback) {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, orderBy('timestamp', 'desc'));

    return onSnapshot(q, (snapshot) => {
        const products = [];
        snapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        callback(products);
    }, (error) => {
        console.error("Error listening to products: ", error);
        alert("Failed to load products. Please check your connection.");
    });
}

// Real-time listener for packages/categories
export function listenToPackages(callback) {
    const packagesRef = collection(db, 'packages');
    
    return onSnapshot(packagesRef, (snapshot) => {
        const packages = [];
        snapshot.forEach((doc) => {
            packages.push({ id: doc.id, ...doc.data() });
        });
        // Default packages if empty
        if (packages.length === 0) {
            packages.push(
                { id: "detox", name: "Detox" },
                { id: "immunity", name: "Immunity" },
                { id: "vitality", name: "Vitality" },
                { id: "skincare", name: "Skincare" }
            );
        }
        callback(packages);
    });
}
