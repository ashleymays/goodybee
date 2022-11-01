// Open Filters Container
let openAsideBtn = document.querySelector('.aside-open-btn')
let aside = document.querySelector('.aside')
if (openAsideBtn && aside) {
    openAsideBtn.addEventListener('click', _ => {
        aside.style.left = '0'
    })
}



// Close Filters Container
let closeAsideBtn = document.querySelector('.aside-close-btn')
if (closeAsideBtn) {
    closeAsideBtn.addEventListener('click', _ => {
        aside.style.left = aside.style.width
    })
}



// Open/Close Dropdown Menus when they're clicked
let dropdownMenus = document.querySelectorAll('.dropdown-container')
let isDropdownOpen = []
if (dropdownMenus) {
    dropdownMenus.forEach((item, index) => {
        isDropdownOpen[index] = false
        item.addEventListener('click', () => {
            let dropdownList = item.querySelector('.dropdown-list')
            let plusIcon = item.querySelector('.aside-item__icon > .material-icons-outlined')

            // Open
            if (!isDropdownOpen[index]) {
                dropdownList.style.height = '20rem'
                plusIcon.style.transform = 'rotate(45deg)'
                isDropdownOpen[index] = true
            }

            // Close
            else {
                dropdownList.style.height = '0'
                plusIcon.style.transform = 'rotate(0)'
                isDropdownOpen[index] = false
            }
        })
    })
}




// Reload page and display 'Loading...' text when 'Load More' button is pressed.
let loadMoreBtn = document.getElementById('load-more-btn')
let loadingText = document.getElementById('loading-text')
if (loadMoreBtn && loadingText) {
    loadMoreBtn.addEventListener('click', async _ => {
        try {
            // Display loading text and hide button.
            loadingText.style.display = 'block'
            loadMoreBtn.style.display = 'none'

            let res = await fetch('/recipes/more-recipes', {
                method: 'get',
                headers: { 'Content-Type' : 'application/json' },
            })
            if (res.ok) {
                location.reload()
            }
        } catch(err) {
            console.error(err)
        }        
    })
}


// Hide loading text and display button.
if (window.location.pathname === '/recipes' && loadMoreBtn && loadingText) {
    loadingText.style.display = 'none'
    loadMoreBtn.style.display = 'block'
}


// Change bookmark background and save to database
let recipeImages = document.querySelectorAll('.recipe__img')
let recipeParams = document.querySelectorAll('.recipe__link')
let recipeTitles = document.querySelectorAll('.recipe__title')
let recipeSubtitles = document.querySelectorAll('.recipe__subtitle')
let bookmarks = document.querySelectorAll('.recipe__bookmark span')
let bookmarkInputs = document.querySelectorAll('.recipe__bookmark input')
if (bookmarks) {
    bookmarks.forEach((item, index) => {
        item.addEventListener('click', _ => {
            if (bookmarkInputs[index].checked) {
                item.innerHTML = 'bookmark_border'
                removeBookmark(index)
            } else {
                item.innerHTML = 'bookmark'
                addBookmark(index)
            }
        })
    })
}

const addBookmark = async (index) => {   
    try {
        // Store recipe information
        const info = {
            id: recipeParams[index].getAttribute('href').substring(16), // ID of recipe in API
            title: recipeTitles[index].innerHTML,
            subtitle: recipeSubtitles[index].innerHTML,
        }
        console.log(info.id)
        let res = await fetch('/user/add-bookmark', {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info),
        })
        if (!res.ok) {
            location.assign(res.url)
        }
    } catch(err) {
        console.error(err)
    }
}

const removeBookmark = async (index) => {
    try {
        // Send info to find item in database collection
        const info = {
            id: recipeParams[index].getAttribute('href').substring(16),
        }
        let res = await fetch('/user/remove-bookmark', {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(info)
        })
        return res.json()
    } catch(err) {
        console.error(err)
    }
}



// Upload profile picture
let avatarInput = document.getElementById('avatar__input')
if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
        try {
            let data = new FormData();
            data.append('file', e.target.files[0])
            await fetch('/user/profile-picture', {
                method: 'PUT',
                body: data
            })
            location.reload()
        } catch(err) {
            alert('Failed to upload picture.')
            console.error(err)
        }
    })
}


// Open and close popup forms
let popupForms = document.querySelectorAll('.popup-form')
let openPopupBtns = document.querySelectorAll('.open-popup-btn')
let closePopupBtns = document.querySelectorAll('.close-popup-btn')
let overlay = document.getElementById('overlay')

if (popupForms) {
    // Open popup form
    if (openPopupBtns) {
        openPopupBtns.forEach((item, index) => {
            item.addEventListener('click', _ => {
                popupForms[index].classList.remove('hidden')
                overlay.classList.remove('hidden')
            })
        })
    }
    
    // Close popup form
    if (closePopupBtns) {
        closePopupBtns.forEach((item, index) => {
            item.addEventListener('click', _ => {
                popupForms[index].classList.add('hidden')
                overlay.classList.add('hidden')
            })
        })
    }
}


// Make sure user types "delete" before deleting the account
let deleteAcctForm = document.getElementById('delete-account-form')
let deleteAcctText = document.getElementById('delete-acct-text')
if (deleteAcctForm) {
    deleteAcctForm.addEventListener('submit', e => {
        if (deleteAcctText.value !== 'delete') {
            e.preventDefault()
        }
    })
}