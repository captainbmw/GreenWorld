import { db } from './firebase-config.js';
import { ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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
    const productsRef = ref(db, 'products');

    return onValue(productsRef, (snapshot) => {
        const data = snapshot.val();
        const products = [];
        if (data) {
            Object.keys(data).forEach((id) => {
                products.push({ id, ...data[id] });
            });
            // Sort by timestamp descending
            products.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        }
        callback(products);
    }, (error) => {
        console.error("Error listening to products: ", error);
        alert("Failed to load products. Please check your connection.");
    });
}

// Real-time listener for packages/categories
export function listenToPackages(callback) {
    const packagesRef = ref(db, 'packages');
    
    return onValue(packagesRef, (snapshot) => {
        const data = snapshot.val();
        const packages = [];
        if (data) {
            Object.keys(data).forEach((id) => {
                packages.push({ id, ...data[id] });
            });
        }
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
