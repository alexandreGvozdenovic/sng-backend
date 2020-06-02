function testOpen(moment, openingPeriods) {
    function formatTime(number) {
        if(number < 10) {
            return `0${number}`;
        } else { 
            return `${number}`;
        }
    }
    
    const nextMoment = new Date(moment);
    // const nextMoment = moment.setDate(new Date(moment.getDate() + 1));
    const momentHour = moment.getHours();
    const momentMinutes = moment.getMinutes();
    
    const momentTime = Number(formatTime(momentHour)+formatTime(momentMinutes));
    const momentDay = moment.getDay();
    nextMoment.setDate(moment.getDate() + 1);
    const nextMomentDay = nextMoment.getDay();
    // console.log('moment',moment);
    // console.log('next moment',nextMoment);
    
    let isOpen=false;
    for(const elem of openingPeriods) {
        if(elem.open.day === momentDay && elem.open.time<momentTime) {
            isOpen = true;
        }
    }
    
    let isNotClosed=false;
    for(const elem of openingPeriods) {
        if(elem.close.day === nextMomentDay && elem.close.time<momentTime) {
            isNotClosed = true;
        }
    }
    
    isOpen&&isNotClosed ? console.log(`C'est ouvert`) : console.log(`C'est fermé`);
    if(isOpen&&isNotClosed) {
        return true
    } else {
        return false    
    };
};
exports.testOpen = testOpen