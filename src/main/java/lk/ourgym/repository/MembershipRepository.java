package lk.ourgym.repository;

import lk.ourgym.model.Membership;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    
    @Query("SELECT m FROM Membership m WHERE m.deleteddatetime IS NULL")
    List<Membership> getActiveMemberships();
    
    @Query("SELECT m FROM Membership m WHERE m.deleteddatetime IS NULL AND m.status = true")
    List<Membership> getActiveAndEnabledMemberships();
    
    @Query("SELECT m FROM Membership m WHERE m.deleteddatetime IS NULL AND m.name = :name")
    Membership getByName(@Param("name") String name);
}
