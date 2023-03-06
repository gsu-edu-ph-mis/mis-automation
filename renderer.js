let vApp = new Vue({
    el: '#vApp',
    delimiters: ["${", "}"],
    mixins: [],
    data: {
        pending: false,
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
        url: 'http://203.177.71.162/sias/',
        username: 'JGERADA',
        password: '138915',
        college: 'CAGS',
        semester: '22-1',
        course: 'BSF',
        year: '1',
        studentId: '',
        group1: {
            logs: [],
        },
        group2: {
            logs: [],
        },
        group3: {
            logs: [],
        }
    },
    computed: {

    },
    methods: {
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

            let result = await window.electronAPI.sendToMain('promotional-list', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit 
            me.pending = false
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
                me.year
            ]

            let result = await window.electronAPI.sendToMain('enrollment-list', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit 
            me.pending = false
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
                me.semester,
                me.studentId
            ]

            let result = await window.electronAPI.sendToMain('term-grades', params)

            if (result != 'Ok') {
                alert('Error. Something went wrong.')
            }
            console.log(result)
            await new Promise(resolve => setTimeout(resolve, 100)) // Rate limit 
            me.pending = false
            document.getElementById("bottom").scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});

// This is assigned a callback function from preload.js
window.electronAPI.onDataFromMain((_event, value, group) => {
    if (group === 'group1') {
        vApp.group1.logs.push(value)
    }
})