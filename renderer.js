let vApp = new Vue({
    el: '#vApp',
    delimiters: ["${", "}"],
    mixins: [],
    data: {
        pending: false,
        expanded: false,
        page: 1,
        logs: [],
        tabs: [
            {
                text: 'Promotional List',
                value: 1,
            },
            {
                text: 'Enrollment List',
                value: 2,
            },
            {
                text: 'Term Grades',
                value: 3,
            }
        ],
        colleges: [
            'CAGS',
            'CAS',
            'CBM',
            'CCJE',
            'CEIT',
            'CST',
            'CTE',
        ],
        semesters: [
            `21-1`,
            `21-2`,
            `22-1`,
            `22-2`,
            `23-1`,
            `23-2`,
        ],
        courses: [
            'BSA',
            'BSF',
            'BAEL',
            'BPA',
            'BSBAFM',
            'BSBAHRM',
            'BSENTREP',
            'BSHM',
            'BSREM',
            'BSTM',
            'BSCRIM',
            'BITAT',
            'BITET',
        ],
        url: '',
        username: '',
        password: '',
        college: '',
        semester: '',
        course: '',
        year: '',
        studentId: '',
        group1: {
            logs: [],
        },
        group2: {
            logs: [],
        },
        group3: {
            logs: [],
        },
        currentDoing: '',
        progressBits: []
    },
    methods: {
        logClass: function(log){
            if(new RegExp(/error/i).test(log)){
                return 'text-danger'
            }
        },
        getWidth: function(){
            return 100 / this.progressBits.length
        },
        isActiveTab: function (page) {
            return (this.page === page) ? `active` : ``
        },
        onFormPromotionalListSubmit: async function () {
            let me = this
            me.pending = true
            let params = [
                me.username,
                me.password,
                me.college,
                me.semester,
                me.course,
                me.year,
                me.url,
            ]
            me.logs = []
            let result = await window.electronAPI.sendToMain('promotional-list', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            me.pending = false
            alert(vApp.currentDoing)
            document.getElementById("bottom").scrollIntoView({
                behavior: 'smooth'
            });
        },
        onFormEnrollmentListSubmit: async function () {
            let me = this
            me.pending = true
            let params = [
                me.username,
                me.password,
                me.college,
                me.semester,
                me.course,
                me.year,
                me.url,
            ]
            me.logs = []
            let result = await window.electronAPI.sendToMain('enrollment-list', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit 
            me.pending = false
            alert(vApp.currentDoing)
            document.getElementById("bottom").scrollIntoView({
                behavior: 'smooth'
            });
        },
        onFormTermGradesSubmit: async function () {
            let me = this
            me.pending = true
            let params = [
                me.username,
                me.password,
                me.studentId,
                me.semester,
                me.url,
            ]
            me.logs = []
            let result = await window.electronAPI.sendToMain('term-grades', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit 
            me.pending = false
            alert(vApp.currentDoing)
            document.getElementById("bottom").scrollIntoView({
                behavior: 'smooth'
            });
        },
        showFile: async (path) => {
            let result = await window.electronAPI.sendToMain('show-file', path)
        }
    }
});

// This is assigned a callback function from preload.js
window.electronAPI.onDataFromMain((_event, value, group) => {
    vApp.currentDoing = value.currentDoing
    vApp.progressBits = value.progressBits
    vApp.logs.push(value.currentDoing)
})