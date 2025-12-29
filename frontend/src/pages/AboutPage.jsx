import '../styles/AboutPage.css';

/**
 * AboutPage - The "About Us" page component for OPM Code Generator project.
 * - Displays project supervisor and team members with their roles and contact information.
 */
const AboutPage = () => {
  return (
    <div className="about-page">
      <div className="about-container">
        {/* Page Title */}
        <h1 className="page-title">Our Team</h1>

        {/* Team Grid */}
        <div className="team-grid">

          <div className="person-card">
            <div className="person-image-container">
              <div className="person-image">
                <img
                  src="/images/sagi.jpg"
                  alt="Sagi Yosofov"
                  loading="lazy"
                />
              </div>
            </div>
            <h3 className="person-name">Sagi Yosofov</h3>
            <p className="person-role">Full Stack Developer</p>
            <p className="person-email">sagi9969@gmail.com</p>
            <p className="person-description">
              Sagi, 26, from Qiryat Bialik, is a Full Stack Developer and a four-year software engineering student. He works on both front-end and back-end development of the system, leading the integration with Claude AI for translating OPM diagrams to code.
            </p>
          </div>


          <div className="person-card supervisor-card">
            <div className="person-image-container">
              <div className="person-image">
                <img
                  src="/images/natali.jpeg"
                  alt="Dr. Natali Levi"
                  loading="lazy"
                />
              </div>
            </div>
            <h3 className="person-name">Dr. Natali Levi</h3>
            <p className="person-role supervisor-role">Project Supervisor</p>
            <p className="person-email">natalyl@braude.ac.il</p>
            <p className="person-description">
              Dr. Natali Levi is a senior lecturer in the Software Engineering Department at Braude College of Engineering. She supervises the OPM Code Generator project and provides professional and academic guidance to the development team.
            </p>
          </div>


          <div className="person-card">
            <div className="person-image-container">
              <div className="person-image">
                <img
                  src="/images/liroy.jpg"
                  alt="Liroy Ben Shimon"
                  loading="lazy"
                />
              </div>
            </div>
            <h3 className="person-name">Liroy Ben Shimon</h3>
            <p className="person-role">Full Stack Developer</p>
            <p className="person-email">bsliroy178@gmail.com</p>
            <p className="person-description">
              Liroy, 25, from Kiryat Ata, is a Full Stack Developer and a four-year software engineering student. He works on both front-end and back-end development of the system, leading the integration with Claude AI for translating OPM diagrams to code.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;